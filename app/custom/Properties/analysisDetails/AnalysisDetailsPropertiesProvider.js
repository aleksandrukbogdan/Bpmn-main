// Import your custom property entries.
// The entry is a text input field with logic attached to create,
// update and delete the "spell" property.


import AnalysisDetailsProps from './parts/AnalysisDetailsProps';

import { is } from 'bpmn-js/lib/util/ModelUtil';

const LOW_PRIORITY = 500;


/**
 * A provider with a `#getGroups(element)` method
 * that exposes groups for a diagram element.
 *
 * @param {PropertiesPanel} propertiesPanel
 * @param {Function} translate
 */
export default function AnalysisDetailsPropertiesProvider(propertiesPanel, translate) {

  // API ////////

  /**
   * Return the groups provided for the given element.
   *
   * @param {DiagramElement} element
   *
   * @return {(Object[]) => (Object[])} groups middleware
   */
  this.getGroups = function(element) {

    /**
     * We return a middleware that modifies
     * the existing groups.
     *
     * @param {Object[]} groups
     *
     * @return {Object[]} modified groups
     */
    return function(groups) {

      // Add the "LTSM" group
      if (is(element, 'bpmn:Task')) {
        groups.push(createLTSMGroup(element, translate));
      }
      

      return groups;
    };
  };

  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

AnalysisDetailsPropertiesProvider.$inject = [ 'propertiesPanel', 'translate' ];


function createLTSMGroup(element, translate) {

  // create a group called "Magic properties".
  const LtsmGroup = {
    id: 'AnalysisDetails Props',
    label: translate('AnalysisDetails'),
    entries: AnalysisDetailsProps(element),
    tooltip: translate('Make sure you know what you are doing!')
  };

  return LtsmGroup;
}