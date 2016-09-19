///<reference path="../../headers/common.d.ts" />

import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import {Variable, assignModelProperties} from './variable';
import {VariableSrv, variableConstructorMap} from './variable_srv';

export class DatasourceVariable implements Variable {
  regex: any;
  query: string;
  options: any;

 defaults = {
    type: 'datasource',
    name: '',
    hide: 0,
    label: '',
    current: {text: '', value: ''},
    regex: '',
    options: [],
    query: '',
  };

  /** @ngInject */
  constructor(private model, private datasourceSrv, private variableSrv) {
    assignModelProperties(this, model, this.defaults);
  }

  getModel() {
    assignModelProperties(this.model, this, this.defaults);
    return this.model;
  }

  setValue(option) {
    return this.variableSrv.setOptionAsCurrent(this, option);
  }

  updateOptions() {
    var options = [];
    var sources = this.datasourceSrv.getMetricSources({skipVariables: true});
    var regex;

    if (this.regex) {
      regex = kbn.stringToJsRegex(this.regex);
    }

    for (var i = 0; i < sources.length; i++) {
      var source = sources[i];
      // must match on type
      if (source.meta.id !== this.query) {
        continue;
      }

      if (regex && !regex.exec(source.name)) {
        continue;
      }

      options.push({text: source.name, value: source.name});
    }

    if (options.length === 0) {
      options.push({text: 'No data sources found', value: ''});
    }

    this.options = options;
    return this.variableSrv.validateVariableSelectionState(this);
  }

  dependsOn(variable) {
    return false;
  }

  setValueFromUrl(urlValue) {
    return this.variableSrv.setOptionFromUrl(this, urlValue);
  }
}

variableConstructorMap['datasource'] = DatasourceVariable;
