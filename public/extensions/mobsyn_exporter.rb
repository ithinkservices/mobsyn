# MobSyn - Extensão Oficial para SketchUp
# Exportador de Engenharia e Orçamento 3D para o MobSyn ERP

require 'sketchup.rb'
require 'extensions.rb'

module MobSyn
  module Exporter
    EXTENSION_NAME = 'MobSyn - Exportador 3D & Marcenaria'.freeze
    EXTENSION_VERSION = '1.0.0'.freeze

    unless file_loaded?(__FILE__)
      ex = SketchupExtension.new(EXTENSION_NAME, 'mobsyn_exporter/main.rb')
      ex.description = 'Exporta peças, módulos, medidas de corte, posições 3D e materiais para o MobSyn ERP.'
      ex.version     = EXTENSION_VERSION
      ex.creator     = 'MobSyn Team'
      ex.copyright   = '2026 MobSyn'
      Sketchup.register_extension(ex, true)
      file_loaded?(__FILE__)
    end
  end
end
