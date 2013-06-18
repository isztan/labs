/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {

  // imports

  // instance api

  var api = scope.api.instance.events;

  var DELEGATES = api.DELEGATES;
  var EVENT_PREFIX = api.EVENT_PREFIX;

  // logging flags
  var log = window.logFlags || {};
  log.events = true;

  // polymer-element event feature

  var events = { 
    inheritDelegates: function(prototype) {
      this.inheritObject(prototype, DELEGATES);
    },
    parseHostEvents: function() {
      // our delegates map
      var delegates = this.prototype[DELEGATES];
      // extract data from attributes into delegates
      this.addAttributeDelegates(delegates);
    },
    addAttributeDelegates: function(delegates) {
      // for each attribute
      for (var i=0, a; a=this.attributes[i]; i++) {
        // does it have magic marker identifying it as an event delegate?
        if (hasEventPrefix(a.name)) {
          // if so, add the info to delegates
          delegates[removeEventPrefix(a.name)] = a.value;
        }
      }
    },
    parseLocalEvents: function() {
      var delegates = this.prototype[DELEGATES];
      // extract data from all templates into delegates
      this.querySelectorAll('template').forEach(function(t) {
        // acquire delegates from entire subtree at t
        this.accumulateTemplatedEvents(t, delegates);
      }, this);
      console.log('[%s] parseLocalEvents:', this.attributes.name.value, delegates);
    },
    accumulateEvents: function(node, events) {
      events = events || {};
      this.accumulateNodeEvents(node, events);
      this.accumulateChildEvents(node, events);
      this.accumulateTemplatedEvents(node, events);
      return events;
    },
    accumulateNodeEvents: function(node, events) {
      if (node.attributes) {
        node.attributes.forEach(function(a) {
          if (hasEventPrefix(a.name)) {
            this.accumulateEvent(removeEventPrefix(a.name), events);
          }
        }, this);
      }
    },
    accumulateEvent: function(name, events) {
      events[event_translations[name] || name] = 1;
    },
    accumulateChildEvents: function(node, events) {
      node.childNodes.forEach(function(n) {
        this.accumulateEvents(n, events);
      }, this);
    },
    accumulateTemplatedEvents: function(node, events) {
      if (node.localName == 'template') {
        var content = getTemplateContent(node);
        if (content) {
          this.accumulateChildEvents(content, events);
        }
      }
    },
  };

  var event_translations = {
    webkitanimationstart: 'webkitAnimationStart',
    webkitanimationend: 'webkitAnimationEnd',
    webkittransitionend: 'webkitTransitionEnd',
    domfocusout: 'DOMFocusOut',
    domfocusin: 'DOMFocusIn'
  };

  function hasEventPrefix(n) {
    return n.slice(0, prefixLength) == EVENT_PREFIX;
  }

  function removeEventPrefix(n) {
    return n.slice(prefixLength);
  }

  var prefixLength = EVENT_PREFIX.length;
  
  // TODO(sorvell): Currently in MDV, there is no way to get a template's
  // effective content. A template can have a ref property
  // that points to the template from which this one has been cloned.
  // Remove this when the MDV api is improved
  // (https://github.com/polymer-project/mdv/issues/15).
  function getTemplateContent(template) {
    return template.ref ? template.ref.content : template.content;
  }

  events.event_translations = event_translations;

  // exports

  scope.api.declarative.events = events;

})(Polymer);