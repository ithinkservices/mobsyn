# MobSyn - Módulo Principal do Exportador para SketchUp
require 'json'
require 'set'

module MobSyn
  module Exporter
    INCH_TO_MM = 25.4

    def self.exportar_projeto
      model = Sketchup.active_model
      unless model
        UI.messagebox('Nenhum modelo ativo no SketchUp.')
        return
      end

      nome_padrao = model.title.empty? ? 'projeto_mobsyn.json' : "#{model.title}_mobsyn.json"
      caminho_salvar = UI.savepanel('Salvar Arquivo para o MobSyn ERP', '', nome_padrao)
      return unless caminho_salvar

      caminho_salvar += '.json' unless caminho_salvar.downcase.end_with?('.json')

      dados_projeto = coletar_dados_modelo(model)

      File.open(caminho_salvar, 'w:UTF-8') do |f|
        f.write(JSON.pretty_generate(dados_projeto))
      end

      qtd_pecas = dados_projeto[:components].length
      UI.messagebox("Exportação concluída com sucesso!\n\nForam exportados #{qtd_pecas} componentes reais com medidas, posições e materiais.\n\nArquivo salvo em:\n#{caminho_salvar}\n\nAgora basta arrastar este arquivo para a aba de Importação do MobSyn!")
    end

    def self.coletar_dados_modelo(model)
      componentes = []
      ambientes = Set.new

      processar_entidades(model.entities, Geom::Transformation.new, 'Ambiente Geral', componentes, ambientes)

      {
        versao_plugin: '1.0.0',
        software_origem: 'sketchup_ruby_extension',
        nome_projeto: model.title.empty? ? 'Projeto SketchUp' : model.title,
        data_exportacao: Time.now.strftime('%Y-%m-%d %H:%M:%S'),
        unidade: 'mm',
        total_componentes: componentes.length,
        ambientes: ambientes.to_a,
        components: componentes
      }
    end

    def self.processar_entidades(entities, parent_transform, current_layer, componentes, ambientes)
      entities.each do |entity|
        if entity.is_a?(Sketchup::ComponentInstance) || entity.is_a?(Sketchup::Group)
          transf_global = parent_transform * entity.transformation
          layer_name = entity.layer ? entity.layer.name : current_layer
          layer_name = 'Ambiente Geral' if layer_name == 'Layer0' || layer_name == 'Untagged'
          ambientes.add(layer_name)

          nome_def = if entity.is_a?(Sketchup::ComponentInstance)
                       entity.definition.name
                     else
                       entity.name.empty? ? entity.definition.name : entity.name
                     end

          nome_instancia = entity.name.empty? ? nome_def : entity.name

          # Bounding Box em mm
          bbox = entity.definition.bounds
          largura_mm = (bbox.width * INCH_TO_MM).round(1)
          altura_mm = (bbox.height * INCH_TO_MM).round(1)
          profundidade_mm = (bbox.depth * INCH_TO_MM).round(1)

          scale_x = transf_global.xscale
          scale_y = transf_global.yscale
          scale_z = transf_global.zscale

          w_final = (largura_mm * scale_x).abs.round(1)
          h_final = (altura_mm * scale_y).abs.round(1)
          d_final = (profundidade_mm * scale_z).abs.round(1)

          pos_origem = transf_global.origin
          pos_x = (pos_origem.x * INCH_TO_MM).round(1)
          pos_y = (pos_origem.z * INCH_TO_MM).round(1)
          pos_z = (-pos_origem.y * INCH_TO_MM).round(1)

          mat = entity.material || (entity.is_a?(Sketchup::ComponentInstance) ? entity.definition.material : nil)
          mat_nome = mat ? mat.name : 'MDF Padrão'
          cor_hex = if mat && mat.color
                      format('#%02x%02x%02x', mat.color.red, mat.color.green, mat.color.blue)
                    else
                      '#9c683b'
                    end

          componentes << {
            id: "skp_#{componentes.length + 1}",
            codigo: "SKP-#{(componentes.length + 1).to_s.rjust(3, '0')}",
            name: nome_instancia,
            definition_name: nome_def,
            layer: layer_name,
            ambiente: layer_name,
            material: mat_nome,
            material_name: mat_nome,
            color_hex: cor_hex,
            quantity: 1,
            dimensions_mm: {
              width: w_final,
              height: h_final,
              depth: d_final
            },
            position_mm: {
              x: pos_x,
              y: pos_y,
              z: pos_z
            }
          }
        end
      end
    end

    unless file_loaded?(__FILE__)
      menu = UI.menu('Plugins')
      menu_mobsyn = menu.add_submenu('MobSyn')
      menu_mobsyn.add_item('Exportar Projeto para MobSyn (JSON)') {
        exportar_projeto
      }

      tb = UI::Toolbar.new('MobSyn')
      cmd = UI::Command.new('Exportar para MobSyn') { exportar_projeto }
      cmd.tooltip = 'Exportar Projeto 3D e Lista de Peças para o MobSyn ERP'
      cmd.status_bar_text = 'Gera arquivo JSON compatível com o MobSyn'
      tb.add_item(cmd)
      tb.show if tb.get_last_state == TB_VISIBLE

      file_loaded?(__FILE__)
    end
  end
end
