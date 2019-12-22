// Utility function
function Util () {};

/* 
	class manipulation functions
*/
Util.hasClass = function(el, className) {
	if (el.classList) return el.classList.contains(className);
	else return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	if (el.classList) el.classList.add(classList[0]);
 	else if (!Util.hasClass(el, classList[0])) el.className += " " + classList[0];
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	if (el.classList) el.classList.remove(classList[0]);	
	else if(Util.hasClass(el, classList[0])) {
		var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
		el.className=el.className.replace(reg, ' ');
	}
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* 
  DOM manipulation
*/
Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < el.children.length; i++) {
    if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if(selector.nodeType){
    return elem === selector;
  }

  var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
    length = qa.length,
    returnArr = [];

  while(length--){
    if(qa[length] === elem){
      return true;
    }
  }

  return false;
};

/* 
	Animate height of an element
*/
Util.setHeight = function(start, to, element, duration, cb) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    var val = parseInt((progress/duration)*change + start);
    element.style.height = val+"px";
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start+"px";
  window.requestAnimationFrame(animateHeight);
};

/* 
	Smooth Scroll
*/

Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
        window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/* 
  Focus utility classes
*/

//Move focus to an element
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

/* 
  Misc
*/

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  if('CSS' in window) {
    return CSS.supports(property, value);
  } else {
    var jsProperty = property.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase();});
    return jsProperty in document.body.style;
  }
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
}; 

/* 
	Polyfills
*/
//Closest() method
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(s) {
		var el = this;
		if (!document.documentElement.contains(el)) return null;
		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1); 
		return null;
	};
}

//Custom Event() constructor
if ( typeof window.CustomEvent !== "function" ) {

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
}

/* 
	Animation curves
*/
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};


/* JS Utility Classes */
(function() {
  // make focus ring visible only for keyboard navigation (i.e., tab key) 
  var focusTab = document.getElementsByClassName('js-tab-focus');
  function detectClick() {
    if(focusTab.length > 0) {
      resetFocusTabs(false);
      window.addEventListener('keydown', detectTab);
    }
    window.removeEventListener('mousedown', detectClick);
  };

  function detectTab(event) {
    if(event.keyCode !== 9) return;
    resetFocusTabs(true);
    window.removeEventListener('keydown', detectTab);
    window.addEventListener('mousedown', detectClick);
  };

  function resetFocusTabs(bool) {
    var outlineStyle = bool ? '' : 'none';
    for(var i = 0; i < focusTab.length; i++) {
      focusTab[i].style.setProperty('outline', outlineStyle);
    }
  };
  window.addEventListener('mousedown', detectClick);
}());
(function() {
  var Accordion = function(element) {
    this.element = element;
    this.items = Util.getChildrenByClassName(
      this.element,
      'js-accordion__item'
    );
    this.showClass = 'accordion__item--is-open';
    this.animateHeight = this.element.getAttribute('data-animation') == 'on';
    this.multiItems = !(this.element.getAttribute('data-multi-items') == 'off');
    this.initAccordion();
  };

  Accordion.prototype.initAccordion = function() {
    //set initial aria attributes
    for (var i = 0; i < this.items.length; i++) {
      var button = this.items[i].getElementsByTagName('button')[0],
        content = this.items[i].getElementsByClassName(
          'js-accordion__panel'
        )[0],
        isOpen = Util.hasClass(this.items[i], this.showClass)
          ? 'true'
          : 'false';
      Util.setAttributes(button, {
        'aria-expanded': isOpen,
        'aria-controls': 'accordion-content-' + i,
        id: 'accordion-header-' + i
      });
      Util.addClass(button, 'js-accordion__trigger');
      Util.setAttributes(content, {
        'aria-labelledby': 'accordion-header-' + i,
        id: 'accordion-content-' + i
      });
    }

    //listen for Accordion events
    this.initAccordionEvents();
  };

  Accordion.prototype.initAccordionEvents = function() {
    var self = this;

    this.element.addEventListener('click', function(event) {
      var trigger = event.target.closest('.js-accordion__trigger');
      //check index to make sure the click didn't happen inside a children accordion
      if (
        trigger &&
        Util.getIndexInArray(self.items, trigger.parentElement) >= 0
      )
        self.triggerAccordion(trigger);
    });
  };

  Accordion.prototype.triggerAccordion = function(trigger) {
    var self = this;
    var bool = trigger.getAttribute('aria-expanded') === 'true';

    this.animateAccordion(trigger, bool);
  };

  Accordion.prototype.animateAccordion = function(trigger, bool) {
    var self = this;
    var item = trigger.closest('.js-accordion__item'),
      content = item.getElementsByClassName('js-accordion__panel')[0],
      ariaValue = bool ? 'false' : 'true';

    if (!bool) Util.addClass(item, this.showClass);
    trigger.setAttribute('aria-expanded', ariaValue);

    if (this.animateHeight) {
      //store initial and final height - animate accordion content height
      var initHeight = bool ? content.offsetHeight : 0,
        finalHeight = bool ? 0 : content.offsetHeight;
    }

    if (window.requestAnimationFrame && this.animateHeight) {
      Util.setHeight(initHeight, finalHeight, content, 200, function() {
        self.resetContentVisibility(item, content, bool);
      });
    } else {
      self.resetContentVisibility(item, content, bool);
    }

    if (!this.multiItems && !bool) this.closeSiblings(item);
  };

  Accordion.prototype.resetContentVisibility = function(item, content, bool) {
    Util.toggleClass(item, this.showClass, !bool);
    content.removeAttribute('style');
    if (bool && !this.multiItems) {
      // accordion item has been closed -> check if there's one open to move inside viewport
      this.moveContent();
    }
  };

  Accordion.prototype.closeSiblings = function(item) {
    //if only one accordion can be open -> search if there's another one open
    var index = Util.getIndexInArray(this.items, item);
    for (var i = 0; i < this.items.length; i++) {
      if (Util.hasClass(this.items[i], this.showClass) && i != index) {
        this.animateAccordion(
          this.items[i].getElementsByClassName('js-accordion__trigger')[0],
          true
        );
        return false;
      }
    }
  };

  Accordion.prototype.moveContent = function() {
    // make sure title of the accordion just opened is inside the viewport
    var openAccordion = this.element.getElementsByClassName(this.showClass);
    if (openAccordion.length == 0) return;
    var boundingRect = openAccordion[0].getBoundingClientRect();
    if (boundingRect.top < 0 || boundingRect.top > window.innerHeight) {
      var windowScrollTop =
        window.scrollY || document.documentElement.scrollTop;
      window.scrollTo(0, boundingRect.top + windowScrollTop);
    }
  };

  //initialize the Accordion objects
  var accordions = document.getElementsByClassName('js-accordion');
  if (accordions.length > 0) {
    for (var i = 0; i < accordions.length; i++) {
      (function(i) {
        new Accordion(accordions[i]);
      })(i);
    }
  }
})();

(function() {
  var menuBtns = document.getElementsByClassName('js-anim-menu-btn');
  if (menuBtns.length > 0) {
    for (var i = 0; i < menuBtns.length; i++) {
      (function(i) {
        initMenuBtn(menuBtns[i]);
      })(i);
    }

    function initMenuBtn(btn) {
      btn.addEventListener('click', function(event) {
        event.preventDefault();
        console.log('clicked');
        var status = !Util.hasClass(btn, 'anim-menu-btn--state-b');
        Util.toggleClass(btn, 'anim-menu-btn--state-b', status);
        // emit custom event
        var event = new CustomEvent('anim-menu-btn-clicked', {
          detail: status
        });
        btn.dispatchEvent(event);
      });
    }
  }
})();

(function() {
  var Details = function(element, index) {
    this.element = element;
    this.summary = this.element.getElementsByClassName(
      'js-details__summary'
    )[0];
    this.details = this.element.getElementsByClassName(
      'js-details__content'
    )[0];
    this.htmlElSupported = 'open' in this.element;
    this.initDetails(index);
    this.initDetailsEvents();
  };

  Details.prototype.initDetails = function(index) {
    // init aria attributes
    Util.setAttributes(this.summary, {
      'aria-expanded': 'false',
      'aria-controls': 'details--' + index,
      role: 'button'
    });
    Util.setAttributes(this.details, {
      'aria-hidden': 'true',
      id: 'details--' + index
    });
  };

  Details.prototype.initDetailsEvents = function() {
    var self = this;
    if (this.htmlElSupported) {
      // browser supports the <details> element
      this.element.addEventListener('toggle', function(event) {
        var ariaValues = self.element.open
          ? ['true', 'false']
          : ['false', 'true'];
        // update aria attributes when details element status change (open/close)
        self.updateAriaValues(ariaValues);
      });
    } else {
      //browser does not support <details>
      this.summary.addEventListener('click', function(event) {
        event.preventDefault();
        var isOpen = self.element.getAttribute('open'),
          ariaValues = [];

        isOpen
          ? self.element.removeAttribute('open')
          : self.element.setAttribute('open', 'true');
        ariaValues = isOpen ? ['false', 'true'] : ['true', 'false'];
        self.updateAriaValues(ariaValues);
      });
    }
  };

  Details.prototype.updateAriaValues = function(values) {
    this.summary.setAttribute('aria-expanded', values[0]);
    this.details.setAttribute('aria-hidden', values[1]);
  };

  //initialize the Details objects
  var detailsEl = document.getElementsByClassName('js-details');
  if (detailsEl.length > 0) {
    for (var i = 0; i < detailsEl.length; i++) {
      (function(i) {
        new Details(detailsEl[i], i);
      })(i);
    }
  }
})();

(function() {
  var menuAim = function(opts) {
    init(opts);
  };

  window.menuAim = menuAim;

  function init(opts) {
    var activeRow = null,
      mouseLocs = [],
      lastDelayLoc = null,
      timeoutId = null,
      options = Util.extend(
        {
          menu: '',
          rows: false, //if false, get direct children - otherwise pass nodes list
          submenuSelector: '*',
          submenuDirection: 'right',
          tolerance: 75, // bigger = more forgivey when entering submenu
          enter: function() {},
          exit: function() {},
          activate: function() {},
          deactivate: function() {},
          exitMenu: function() {}
        },
        opts
      ),
      menu = options.menu;

    var MOUSE_LOCS_TRACKED = 3, // number of past mouse locations to track
      DELAY = 300; // ms delay when user appears to be entering submenu

    /**
     * Keep track of the last few locations of the mouse.
     */
    var mousemoveDocument = function(e) {
      mouseLocs.push({ x: e.pageX, y: e.pageY });

      if (mouseLocs.length > MOUSE_LOCS_TRACKED) {
        mouseLocs.shift();
      }
    };

    /**
     * Cancel possible row activations when leaving the menu entirely
     */
    var mouseleaveMenu = function() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // If exitMenu is supplied and returns true, deactivate the
      // currently active row on menu exit.
      if (options.exitMenu(this)) {
        if (activeRow) {
          options.deactivate(activeRow);
        }

        activeRow = null;
      }
    };

    /**
     * Trigger a possible row activation whenever entering a new row.
     */
    var mouseenterRow = function() {
        if (timeoutId) {
          // Cancel any previous activation delays
          clearTimeout(timeoutId);
        }

        options.enter(this);
        possiblyActivate(this);
      },
      mouseleaveRow = function() {
        options.exit(this);
      };

    /*
     * Immediately activate a row if the user clicks on it.
     */
    var clickRow = function() {
      activate(this);
    };

    /**
     * Activate a menu row.
     */
    var activate = function(row) {
      if (row == activeRow) {
        return;
      }

      if (activeRow) {
        options.deactivate(activeRow);
      }

      options.activate(row);
      activeRow = row;
    };

    /**
     * Possibly activate a menu row. If mouse movement indicates that we
     * shouldn't activate yet because user may be trying to enter
     * a submenu's content, then delay and check again later.
     */
    var possiblyActivate = function(row) {
      var delay = activationDelay();

      if (delay) {
        timeoutId = setTimeout(function() {
          possiblyActivate(row);
        }, delay);
      } else {
        activate(row);
      }
    };

    /**
     * Return the amount of time that should be used as a delay before the
     * currently hovered row is activated.
     *
     * Returns 0 if the activation should happen immediately. Otherwise,
     * returns the number of milliseconds that should be delayed before
     * checking again to see if the row should be activated.
     */
    var activationDelay = function() {
      if (!activeRow || !Util.is(activeRow, options.submenuSelector)) {
        // If there is no other submenu row already active, then
        // go ahead and activate immediately.
        return 0;
      }

      function getOffset(element) {
        var rect = element.getBoundingClientRect();
        return {
          top: rect.top + window.pageYOffset,
          left: rect.left + window.pageXOffset
        };
      }

      var offset = getOffset(menu),
        upperLeft = {
          x: offset.left,
          y: offset.top - options.tolerance
        },
        upperRight = {
          x: offset.left + menu.offsetWidth,
          y: upperLeft.y
        },
        lowerLeft = {
          x: offset.left,
          y: offset.top + menu.offsetHeight + options.tolerance
        },
        lowerRight = {
          x: offset.left + menu.offsetWidth,
          y: lowerLeft.y
        },
        loc = mouseLocs[mouseLocs.length - 1],
        prevLoc = mouseLocs[0];

      if (!loc) {
        return 0;
      }

      if (!prevLoc) {
        prevLoc = loc;
      }

      if (
        prevLoc.x < offset.left ||
        prevLoc.x > lowerRight.x ||
        prevLoc.y < offset.top ||
        prevLoc.y > lowerRight.y
      ) {
        // If the previous mouse location was outside of the entire
        // menu's bounds, immediately activate.
        return 0;
      }

      if (lastDelayLoc && loc.x == lastDelayLoc.x && loc.y == lastDelayLoc.y) {
        // If the mouse hasn't moved since the last time we checked
        // for activation status, immediately activate.
        return 0;
      }

      // Detect if the user is moving towards the currently activated
      // submenu.
      //
      // If the mouse is heading relatively clearly towards
      // the submenu's content, we should wait and give the user more
      // time before activating a new row. If the mouse is heading
      // elsewhere, we can immediately activate a new row.
      //
      // We detect this by calculating the slope formed between the
      // current mouse location and the upper/lower right points of
      // the menu. We do the same for the previous mouse location.
      // If the current mouse location's slopes are
      // increasing/decreasing appropriately compared to the
      // previous's, we know the user is moving toward the submenu.
      //
      // Note that since the y-axis increases as the cursor moves
      // down the screen, we are looking for the slope between the
      // cursor and the upper right corner to decrease over time, not
      // increase (somewhat counterintuitively).
      function slope(a, b) {
        return (b.y - a.y) / (b.x - a.x);
      }

      var decreasingCorner = upperRight,
        increasingCorner = lowerRight;

      // Our expectations for decreasing or increasing slope values
      // depends on which direction the submenu opens relative to the
      // main menu. By default, if the menu opens on the right, we
      // expect the slope between the cursor and the upper right
      // corner to decrease over time, as explained above. If the
      // submenu opens in a different direction, we change our slope
      // expectations.
      if (options.submenuDirection == 'left') {
        decreasingCorner = lowerLeft;
        increasingCorner = upperLeft;
      } else if (options.submenuDirection == 'below') {
        decreasingCorner = lowerRight;
        increasingCorner = lowerLeft;
      } else if (options.submenuDirection == 'above') {
        decreasingCorner = upperLeft;
        increasingCorner = upperRight;
      }

      var decreasingSlope = slope(loc, decreasingCorner),
        increasingSlope = slope(loc, increasingCorner),
        prevDecreasingSlope = slope(prevLoc, decreasingCorner),
        prevIncreasingSlope = slope(prevLoc, increasingCorner);

      if (
        decreasingSlope < prevDecreasingSlope &&
        increasingSlope > prevIncreasingSlope
      ) {
        // Mouse is moving from previous location towards the
        // currently activated submenu. Delay before activating a
        // new menu row, because user may be moving into submenu.
        lastDelayLoc = loc;
        return DELAY;
      }

      lastDelayLoc = null;
      return 0;
    };

    /**
     * Hook up initial menu events
     */
    menu.addEventListener('mouseleave', mouseleaveMenu);
    var rows = options.rows ? options.rows : menu.children;
    if (rows.length > 0) {
      for (var i = 0; i < rows.length; i++) {
        (function(i) {
          rows[i].addEventListener('mouseenter', mouseenterRow);
          rows[i].addEventListener('mouseleave', mouseleaveRow);
          rows[i].addEventListener('click', clickRow);
        })(i);
      }
    }

    document.addEventListener('mousemove', function(event) {
      !window.requestAnimationFrame
        ? mousemoveDocument(event)
        : window.requestAnimationFrame(function() {
            mousemoveDocument(event);
          });
    });
  }
})();

(function() {
  var Menu = function(element) {
    this.element = element;
    this.elementId = this.element.getAttribute('id');
    this.menuItems = this.element.getElementsByClassName('js-menu__content');
    this.trigger = document.querySelectorAll(
      '[aria-controls="' + this.elementId + '"]'
    );
    this.selectedTrigger = false;
    this.initMenu();
    this.initMenuEvents();
  };

  Menu.prototype.initMenu = function() {
    // init aria-labels
    for (var i = 0; i < this.trigger.length; i++) {
      Util.setAttributes(this.trigger[i], {
        'aria-expanded': 'false',
        'aria-haspopup': 'true'
      });
    }
    // init tabindex
    for (var i = 0; i < this.menuItems.length; i++) {
      this.menuItems[i].setAttribute('tabindex', '0');
    }
  };

  Menu.prototype.initMenuEvents = function() {
    var self = this;
    for (var i = 0; i < this.trigger.length; i++) {
      (function(i) {
        self.trigger[i].addEventListener('click', function(event) {
          event.preventDefault();
          // if the menu had been previously opened by another trigger element -> close it first and reopen in the right position
          if (
            Util.hasClass(self.element, 'menu--is-visible') &&
            self.selectedTrigger != self.trigger[i]
          ) {
            self.toggleMenu(false, false); // close menu
          }
          // toggle menu
          self.selectedTrigger = self.trigger[i];
          self.toggleMenu(
            !Util.hasClass(self.element, 'menu--is-visible'),
            true
          );
        });
      })(i);
    }

    // keyboard events
    this.element.addEventListener('keydown', function(event) {
      // use up/down arrow to navigate list of menu items
      if (!Util.hasClass(event.target, 'js-menu__content')) return;
      if (
        (event.keyCode && event.keyCode == 40) ||
        (event.key && event.key.toLowerCase() == 'arrowdown')
      ) {
        self.navigateItems(event, 'next');
      } else if (
        (event.keyCode && event.keyCode == 38) ||
        (event.key && event.key.toLowerCase() == 'arrowup')
      ) {
        self.navigateItems(event, 'prev');
      }
    });
  };

  Menu.prototype.toggleMenu = function(bool, moveFocus) {
    var self = this;
    // toggle menu visibility
    Util.toggleClass(this.element, 'menu--is-visible', bool);
    if (bool) {
      this.selectedTrigger.setAttribute('aria-expanded', 'true');
      Util.moveFocus(this.menuItems[0]);
      this.element.addEventListener(
        'transitionend',
        function(event) {
          Util.moveFocus(self.menuItems[0]);
        },
        { once: true }
      );
      // position the menu element
      this.positionMenu();
      // add class to menu trigger
      Util.addClass(this.selectedTrigger, 'menu-control--active');
    } else if (this.selectedTrigger) {
      this.selectedTrigger.setAttribute('aria-expanded', 'false');
      if (moveFocus) Util.moveFocus(this.selectedTrigger);
      // remove class from menu trigger
      Util.removeClass(this.selectedTrigger, 'menu-control--active');
      this.selectedTrigger = false;
    }
  };

  Menu.prototype.positionMenu = function(event, direction) {
    var selectedTriggerPosition = this.selectedTrigger.getBoundingClientRect(),
      menuOnTop =
        window.innerHeight <
        selectedTriggerPosition.bottom + this.element.offsetHeight;
    var left = selectedTriggerPosition.left,
      right = window.innerWidth - selectedTriggerPosition.right,
      isRight =
        window.innerWidth <
        selectedTriggerPosition.left + this.element.offsetWidth;
    var horizontal = isRight
        ? 'right: ' + right + 'px;'
        : 'left: ' + left + 'px;',
      vertical = menuOnTop
        ? 'bottom: ' +
          (window.innerHeight - selectedTriggerPosition.top) +
          'px;'
        : 'top: ' + selectedTriggerPosition.bottom + 'px;';
    // check right position is correct -> otherwise set left to 0
    if (isRight && right + this.element.offsetWidth > window.innerWidth)
      horizontal =
        'left: ' +
        parseInt((window.innerWidth - this.element.offsetWidth) / 2) +
        'px;';
    this.element.setAttribute('style', horizontal + vertical);
  };

  Menu.prototype.navigateItems = function(event, direction) {
    event.preventDefault();
    var index = Util.getIndexInArray(this.menuItems, event.target),
      nextIndex = direction == 'next' ? index + 1 : index - 1;
    if (nextIndex < 0) nextIndex = this.menuItems.length - 1;
    if (nextIndex > this.menuItems.length - 1) nextIndex = 0;
    Util.moveFocus(this.menuItems[nextIndex]);
  };

  Menu.prototype.checkMenuFocus = function() {
    var menuParent = document.activeElement.closest('.js-menu');
    if (!menuParent || !this.element.contains(menuParent))
      this.toggleMenu(false, false);
  };

  Menu.prototype.checkMenuClick = function(target) {
    if (
      !this.element.contains(target) &&
      !target.closest('[aria-controls="' + this.elementId + '"]')
    )
      this.toggleMenu(false);
  };

  window.Menu = Menu;

  //initialize the Menu objects
  var menus = document.getElementsByClassName('js-menu');
  if (menus.length > 0) {
    var menusArray = [];
    for (var i = 0; i < menus.length; i++) {
      (function(i) {
        menusArray.push(new Menu(menus[i]));
      })(i);
    }

    // listen for key events
    window.addEventListener('keyup', function(event) {
      if (
        (event.keyCode && event.keyCode == 9) ||
        (event.key && event.key.toLowerCase() == 'tab')
      ) {
        //close menu if focus is outside menu element
        menusArray.forEach(function(element) {
          element.checkMenuFocus();
        });
      } else if (
        (event.keyCode && event.keyCode == 27) ||
        (event.key && event.key.toLowerCase() == 'escape')
      ) {
        // close menu on 'Esc'
        menusArray.forEach(function(element) {
          element.toggleMenu(false, false);
        });
      }
    });
    // close menu when clicking outside it
    window.addEventListener('click', function(event) {
      menusArray.forEach(function(element) {
        element.checkMenuClick(event.target);
      });
    });
    // on resize -> close all menu elements
    window.addEventListener('resize', function(event) {
      menusArray.forEach(function(element) {
        element.toggleMenu(false, false);
      });
    });
  }
})();

(function() {
  var Modal = function(element) {
    this.element = element;
    this.triggers = document.querySelectorAll(
      '[aria-controls="' + this.element.getAttribute('id') + '"]'
    );
    this.firstFocusable = null;
    this.lastFocusable = null;
    this.selectedTrigger = null;
    this.showClass = 'modal--is-visible';
    this.initModal();
  };

  Modal.prototype.initModal = function() {
    var self = this;
    //open modal when clicking on trigger buttons
    if (this.triggers) {
      for (var i = 0; i < this.triggers.length; i++) {
        this.triggers[i].addEventListener('click', function(event) {
          event.preventDefault();
          self.selectedTrigger = event.target;
          self.showModal();
          self.initModalEvents();
        });
      }
    }

    // listen to the openModal event -> open modal without a trigger button
    this.element.addEventListener('openModal', function(event) {
      if (event.detail) self.selectedTrigger = event.detail;
      self.showModal();
      self.initModalEvents();
    });

    // listen to the closeModal event -> close modal without a trigger button
    this.element.addEventListener('closeModal', function(event) {
      if (event.detail) self.selectedTrigger = event.detail;
      self.closeModal();
    });
  };

  Modal.prototype.showModal = function() {
    var self = this;
    Util.addClass(this.element, this.showClass);
    this.getFocusableElements();
    this.firstFocusable.focus();
    // wait for the end of transitions before moving focus
    this.element.addEventListener('transitionend', function cb(event) {
      self.firstFocusable.focus();
      self.element.removeEventListener('transitionend', cb);
    });
    this.emitModalEvents('modalIsOpen');
  };

  Modal.prototype.closeModal = function() {
    if (!Util.hasClass(this.element, this.showClass)) return;
    Util.removeClass(this.element, this.showClass);
    this.firstFocusable = null;
    this.lastFocusable = null;
    if (this.selectedTrigger) this.selectedTrigger.focus();
    //remove listeners
    this.cancelModalEvents();
    this.emitModalEvents('modalIsClose');
  };

  Modal.prototype.initModalEvents = function() {
    //add event listeners
    this.element.addEventListener('keydown', this);
    this.element.addEventListener('click', this);
  };

  Modal.prototype.cancelModalEvents = function() {
    //remove event listeners
    this.element.removeEventListener('keydown', this);
    this.element.removeEventListener('click', this);
  };

  Modal.prototype.handleEvent = function(event) {
    switch (event.type) {
      case 'click': {
        this.initClick(event);
      }
      case 'keydown': {
        this.initKeyDown(event);
      }
    }
  };

  Modal.prototype.initKeyDown = function(event) {
    if (
      (event.keyCode && event.keyCode == 9) ||
      (event.key && event.key == 'Tab')
    ) {
      //trap focus inside modal
      this.trapFocus(event);
    } else if (
      ((event.keyCode && event.keyCode == 13) ||
        (event.key && event.key == 'Enter')) &&
      event.target.closest('.js-modal__close')
    ) {
      event.preventDefault();
      this.closeModal(); // close modal when pressing Enter on close button
    }
  };

  Modal.prototype.initClick = function(event) {
    //close modal when clicking on close button or modal bg layer
    if (
      !event.target.closest('.js-modal__close') &&
      !Util.hasClass(event.target, 'js-modal')
    )
      return;
    event.preventDefault();
    this.closeModal();
  };

  Modal.prototype.trapFocus = function(event) {
    if (this.firstFocusable == document.activeElement && event.shiftKey) {
      //on Shift+Tab -> focus last focusable element when focus moves out of modal
      event.preventDefault();
      this.lastFocusable.focus();
    }
    if (this.lastFocusable == document.activeElement && !event.shiftKey) {
      //on Tab -> focus first focusable element when focus moves out of modal
      event.preventDefault();
      this.firstFocusable.focus();
    }
  };

  Modal.prototype.getFocusableElements = function() {
    //get all focusable elements inside the modal
    var allFocusable = this.element.querySelectorAll(
      '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'
    );
    this.getFirstVisible(allFocusable);
    this.getLastVisible(allFocusable);
  };

  Modal.prototype.getFirstVisible = function(elements) {
    //get first visible focusable element inside the modal
    for (var i = 0; i < elements.length; i++) {
      if (
        elements[i].offsetWidth ||
        elements[i].offsetHeight ||
        elements[i].getClientRects().length
      ) {
        this.firstFocusable = elements[i];
        return true;
      }
    }
  };

  Modal.prototype.getLastVisible = function(elements) {
    //get last visible focusable element inside the modal
    for (var i = elements.length - 1; i >= 0; i--) {
      if (
        elements[i].offsetWidth ||
        elements[i].offsetHeight ||
        elements[i].getClientRects().length
      ) {
        this.lastFocusable = elements[i];
        return true;
      }
    }
  };

  Modal.prototype.emitModalEvents = function(eventName) {
    var event = new CustomEvent(eventName, { detail: this.selectedTrigger });
    this.element.dispatchEvent(event);
  };

  //initialize the Modal objects
  var modals = document.getElementsByClassName('js-modal');
  if (modals.length > 0) {
    var modalArrays = [];
    for (var i = 0; i < modals.length; i++) {
      (function(i) {
        modalArrays.push(new Modal(modals[i]));
      })(i);
    }

    window.addEventListener('keydown', function(event) {
      //close modal window on esc
      if (
        (event.keyCode && event.keyCode == 27) ||
        (event.key && event.key.toLowerCase() == 'escape')
      ) {
        for (var i = 0; i < modalArrays.length; i++) {
          (function(i) {
            modalArrays[i].closeModal();
          })(i);
        }
      }
    });
  }
})();

(function() {
  var SmoothScroll = function(element) {
    this.element = element;
    this.scrollDuration =
      parseInt(this.element.getAttribute('data-duration')) || 300;
    this.dataElement = this.element.getAttribute('data-element');
    this.scrollElement = this.dataElement
      ? document.querySelector(this.dataElement)
      : window;
    this.initScroll();
  };

  SmoothScroll.prototype.initScroll = function() {
    var self = this;

    //detect click on link
    this.element.addEventListener('click', function(event) {
      event.preventDefault();
      var targetId = event.target
          .closest('.js-smooth-scroll')
          .getAttribute('href')
          .replace('#', ''),
        target = document.getElementById(targetId),
        targetTabIndex = target.getAttribute('tabindex'),
        windowScrollTop =
          self.scrollElement.scrollTop || document.documentElement.scrollTop;

      if (!self.dataElement)
        windowScrollTop = window.scrollY || document.documentElement.scrollTop;

      var scrollElement = self.dataElement ? self.scrollElement : false;

      var fixedHeight = self.getFixedElementHeight(); // check if there's a fixed element on the page
      Util.scrollTo(
        target.getBoundingClientRect().top + windowScrollTop - fixedHeight,
        self.scrollDuration,
        function() {
          //move the focus to the target element - don't break keyboard navigation
          Util.moveFocus(target);
          history.pushState(false, false, '#' + targetId);
          self.resetTarget(target, targetTabIndex);
        },
        scrollElement
      );
    });
  };

  SmoothScroll.prototype.resetTarget = function(target, tabindex) {
    if (parseInt(target.getAttribute('tabindex')) < 0) {
      target.style.outline = 'none';
      !tabindex && target.removeAttribute('tabindex');
    }
  };

  SmoothScroll.prototype.getFixedElementHeight = function() {
    var fixedElementDelta = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        'scroll-padding'
      )
    );
    if (isNaN(fixedElementDelta)) {
      // scroll-padding not supported
      fixedElementDelta = 0;
      var fixedElement = document.querySelector(
        this.element.getAttribute('data-fixed-element')
      );
      if (fixedElement)
        fixedElementDelta = parseInt(
          fixedElement.getBoundingClientRect().height
        );
    }
    return fixedElementDelta;
  };

  //initialize the Smooth Scroll objects
  var smoothScrollLinks = document.getElementsByClassName('js-smooth-scroll');
  if (
    smoothScrollLinks.length > 0 &&
    !Util.cssSupports('scroll-behavior', 'smooth') &&
    window.requestAnimationFrame
  ) {
    // you need javascript only if css scroll-behavior is not supported
    for (var i = 0; i < smoothScrollLinks.length; i++) {
      (function(i) {
        new SmoothScroll(smoothScrollLinks[i]);
      })(i);
    }
  }
})();

(function() {
  var SideNav = function(element) {
    this.element = element;
    this.control = this.element.getElementsByClassName('js-subnav__control');
    this.navList = this.element.getElementsByClassName('js-subnav__wrapper');
    this.closeBtn = this.element.getElementsByClassName('js-subnav__close-btn');
    this.firstFocusable = getFirstFocusable(this);
    this.showClass = 'subnav__wrapper--is-visible';
    this.collapsedLayoutClass = 'subnav--collapsed';
    initSideNav(this);
  };

  function getFirstFocusable(sidenav) {
    // get first focusable element inside the subnav
    if (sidenav.navList.length == 0) return;
    var focusableEle = sidenav.navList[0].querySelectorAll(
        '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'
      ),
      firstFocusable = false;
    for (var i = 0; i < focusableEle.length; i++) {
      if (
        focusableEle[i].offsetWidth ||
        focusableEle[i].offsetHeight ||
        focusableEle[i].getClientRects().length
      ) {
        firstFocusable = focusableEle[i];
        break;
      }
    }

    return firstFocusable;
  }

  function initSideNav(sidenav) {
    checkSideNavLayout(sidenav); // switch from --compressed to --expanded layout
    initSideNavToggle(sidenav); // mobile behavior + layout update on resize
  }

  function initSideNavToggle(sidenav) {
    // custom event emitted when window is resized
    sidenav.element.addEventListener('update-sidenav', function(event) {
      checkSideNavLayout(sidenav);
    });

    // mobile only
    if (sidenav.control.length == 0 || sidenav.navList.length == 0) return;
    sidenav.control[0].addEventListener('click', function(event) {
      // open sidenav
      openSideNav(sidenav, event);
    });
    sidenav.element.addEventListener('click', function(event) {
      // close sidenav when clicking on close button/bg layer
      if (
        event.target.closest('.js-subnav__close-btn') ||
        Util.hasClass(event.target, 'js-subnav__wrapper')
      ) {
        closeSideNav(sidenav, event);
      }
    });
  }

  function openSideNav(sidenav, event) {
    // open side nav - mobile only
    event.preventDefault();
    sidenav.selectedTrigger = event.target;
    event.target.setAttribute('aria-expanded', 'true');
    Util.addClass(sidenav.navList[0], sidenav.showClass);
    sidenav.navList[0].addEventListener('transitionend', function cb(event) {
      sidenav.navList[0].removeEventListener('transitionend', cb);
      sidenav.firstFocusable.focus();
    });
  }

  function closeSideNav(sidenav, event, bool) {
    // close side sidenav - mobile only
    if (!Util.hasClass(sidenav.navList[0], sidenav.showClass)) return;
    if (event) event.preventDefault();
    Util.removeClass(sidenav.navList[0], sidenav.showClass);
    if (!sidenav.selectedTrigger) return;
    sidenav.selectedTrigger.setAttribute('aria-expanded', 'false');
    if (!bool) sidenav.selectedTrigger.focus();
    sidenav.selectedTrigger = false;
  }

  function checkSideNavLayout(sidenav) {
    // switch from --compressed to --expanded layout
    var layout = getComputedStyle(sidenav.element, ':before')
      .getPropertyValue('content')
      .replace(/\'|"/g, '');
    if (layout != 'expanded' && layout != 'collapsed') return;
    Util.toggleClass(
      sidenav.element,
      sidenav.collapsedLayoutClass,
      layout != 'expanded'
    );
  }

  var sideNav = document.getElementsByClassName('js-subnav'),
    SideNavArray = [],
    j = 0;
  if (sideNav.length > 0) {
    for (var i = 0; i < sideNav.length; i++) {
      var beforeContent = getComputedStyle(
        sideNav[i],
        ':before'
      ).getPropertyValue('content');
      if (beforeContent && beforeContent != '' && beforeContent != 'none') {
        j = j + 1;
      }
      (function(i) {
        SideNavArray.push(new SideNav(sideNav[i]));
      })(i);
    }

    if (j > 0) {
      // on resize - update sidenav layout
      var resizingId = false,
        customEvent = new CustomEvent('update-sidenav');
      window.addEventListener('resize', function(event) {
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 300);
      });

      function doneResizing() {
        for (var i = 0; i < SideNavArray.length; i++) {
          (function(i) {
            SideNavArray[i].element.dispatchEvent(customEvent);
          })(i);
        }
      }

      window.requestAnimationFrame // init table layout
        ? window.requestAnimationFrame(doneResizing)
        : doneResizing();
    }

    // listen for key events
    window.addEventListener('keyup', function(event) {
      if (
        (event.keyCode && event.keyCode == 27) ||
        (event.key && event.key.toLowerCase() == 'escape')
      ) {
        // listen for esc key - close navigation on mobile if open
        for (var i = 0; i < SideNavArray.length; i++) {
          (function(i) {
            closeSideNav(SideNavArray[i], event);
          })(i);
        }
      }
      if (
        (event.keyCode && event.keyCode == 9) ||
        (event.key && event.key.toLowerCase() == 'tab')
      ) {
        // listen for tab key - close navigation on mobile if open when nav loses focus
        if (document.activeElement.closest('.js-subnav__wrapper')) return;
        for (var i = 0; i < SideNavArray.length; i++) {
          (function(i) {
            closeSideNav(SideNavArray[i], event, true);
          })(i);
        }
      }
    });
  }
})();

(function() {
  var Dropdown = function(element) {
    this.element = element;
    this.trigger = this.element.getElementsByClassName('dropdown__trigger')[0];
    this.dropdown = this.element.getElementsByClassName('dropdown__menu')[0];
    this.triggerFocus = false;
    this.dropdownFocus = false;
    this.hideInterval = false;
    // sublevels
    this.dropdownSubElements = this.element.getElementsByClassName(
      'dropdown__sub-wrapperu'
    );
    this.prevFocus = false; // store element that was in focus before focus changed
    this.addDropdownEvents();
  };

  Dropdown.prototype.addDropdownEvents = function() {
    // init dropdown
    this.initElementEvents(this.trigger, this.triggerFocus); // this is used to trigger the primary dropdown
    this.initElementEvents(this.dropdown, this.dropdownFocus); // this is used to trigger the primary dropdown
    // init sublevels
    this.initSublevels(); // if there are additional sublevels -> bind hover/focus events
  };

  Dropdown.prototype.initElementEvents = function(element, bool) {
    var self = this;
    element.addEventListener('mouseenter', function() {
      bool = true;
      self.showDropdown();
    });
    element.addEventListener('focus', function() {
      self.showDropdown();
    });
    element.addEventListener('mouseleave', function() {
      bool = false;
      self.hideDropdown();
    });
    element.addEventListener('focusout', function() {
      self.hideDropdown();
    });
  };

  Dropdown.prototype.showDropdown = function() {
    if (this.hideInterval) clearInterval(this.hideInterval);
    this.showLevel(this.dropdown, true);
  };

  Dropdown.prototype.hideDropdown = function() {
    var self = this;
    if (this.hideInterval) clearInterval(this.hideInterval);
    this.hideInterval = setTimeout(function() {
      var dropDownFocus = document.activeElement.closest('.js-dropdown'),
        inFocus = dropDownFocus && dropDownFocus == self.element;
      // if not in focus and not hover -> hide
      if (!self.triggerFocus && !self.dropdownFocus && !inFocus) {
        self.hideLevel(self.dropdown);
        // make sure to hide sub/dropdown
        self.hideSubLevels();
        self.prevFocus = false;
      }
    }, 300);
  };

  Dropdown.prototype.initSublevels = function() {
    var self = this;
    var dropdownMenu = this.element.getElementsByClassName('dropdown__menu');
    for (var i = 0; i < dropdownMenu.length; i++) {
      var listItems = dropdownMenu[i].children;
      // bind hover
      new menuAim({
        menu: dropdownMenu[i],
        activate: function(row) {
          var subList = row.getElementsByClassName('dropdown__menu')[0];
          if (!subList) return;
          Util.addClass(row.querySelector('a'), 'dropdown__item--hover');
          self.showLevel(subList);
        },
        deactivate: function(row) {
          var subList = row.getElementsByClassName('dropdown__menu')[0];
          if (!subList) return;
          Util.removeClass(row.querySelector('a'), 'dropdown__item--hover');
          self.hideLevel(subList);
        },
        submenuSelector: '.dropdown__sub-wrapper'
      });
    }
    // store focus element before change in focus
    this.element.addEventListener('keydown', function(event) {
      if (
        (event.keyCode && event.keyCode == 9) ||
        (event.key && event.key == 'Tab')
      ) {
        self.prevFocus = document.activeElement;
      }
    });
    // make sure that sublevel are visible when their items are in focus
    this.element.addEventListener('keyup', function(event) {
      if (
        (event.keyCode && event.keyCode == 9) ||
        (event.key && event.key == 'Tab')
      ) {
        // focus has been moved -> make sure the proper classes are added to subnavigation
        var focusElement = document.activeElement,
          focusElementParent = focusElement.closest('.dropdown__menu'),
          focusElementSibling = focusElement.nextElementSibling;

        // if item in focus is inside submenu -> make sure it is visible
        if (
          focusElementParent &&
          !Util.hasClass(focusElementParent, 'dropdown__menu--is-visible')
        ) {
          self.showLevel(focusElementParent);
        }
        // if item in focus triggers a submenu -> make sure it is visible
        if (
          focusElementSibling &&
          !Util.hasClass(focusElementSibling, 'dropdown__menu--is-visible')
        ) {
          self.showLevel(focusElementSibling);
        }

        // check previous element in focus -> hide sublevel if required
        if (!self.prevFocus) return;
        var prevFocusElementParent = self.prevFocus.closest('.dropdown__menu'),
          prevFocusElementSibling = self.prevFocus.nextElementSibling;

        if (!prevFocusElementParent) return;

        // element in focus and element prev in focus are siblings
        if (
          focusElementParent &&
          focusElementParent == prevFocusElementParent
        ) {
          if (prevFocusElementSibling) self.hideLevel(prevFocusElementSibling);
          return;
        }

        // element in focus is inside submenu triggered by element prev in focus
        if (
          prevFocusElementSibling &&
          focusElementParent &&
          focusElementParent == prevFocusElementSibling
        )
          return;

        // shift tab -> element in focus triggers the submenu of the element prev in focus
        if (
          focusElementSibling &&
          prevFocusElementParent &&
          focusElementSibling == prevFocusElementParent
        )
          return;

        var focusElementParentParent = focusElementParent.parentNode.closest(
          '.dropdown__menu'
        );

        // shift tab -> element in focus is inside the dropdown triggered by a siblings of the element prev in focus
        if (
          focusElementParentParent &&
          focusElementParentParent == prevFocusElementParent
        ) {
          if (prevFocusElementSibling) self.hideLevel(prevFocusElementSibling);
          return;
        }

        if (
          prevFocusElementParent &&
          Util.hasClass(prevFocusElementParent, 'dropdown__menu--is-visible')
        ) {
          self.hideLevel(prevFocusElementParent);
        }
      }
    });
  };

  Dropdown.prototype.hideSubLevels = function() {
    var visibleSubLevels = this.dropdown.getElementsByClassName(
      'dropdown__menu--is-visible'
    );
    if (visibleSubLevels.length == 0) return;
    while (visibleSubLevels[0]) {
      this.hideLevel(visibleSubLevels[0]);
    }
    var hoveredItems = this.dropdown.getElementsByClassName(
      'dropdown__item--hover'
    );
    while (hoveredItems[0]) {
      Util.removeClass(hoveredItems[0], 'dropdown__item--hover');
    }
  };

  Dropdown.prototype.showLevel = function(level, bool) {
    if (bool == undefined) {
      //check if the sublevel needs to be open to the left
      Util.removeClass(level, 'dropdown__menu--left');
      var boundingRect = level.getBoundingClientRect();
      if (
        window.innerWidth - boundingRect.right < 5 &&
        boundingRect.left + window.scrollX > 2 * boundingRect.width
      )
        Util.addClass(level, 'dropdown__menu--left');
    }
    Util.addClass(level, 'dropdown__menu--is-visible');
    Util.removeClass(level, 'dropdown__menu--is-hidden');
  };

  Dropdown.prototype.hideLevel = function(level) {
    if (!Util.hasClass(level, 'dropdown__menu--is-visible')) return;
    Util.removeClass(level, 'dropdown__menu--is-visible');
    Util.addClass(level, 'dropdown__menu--is-hidden');

    level.addEventListener('animationend', function cb() {
      level.removeEventListener('animationend', cb);
      Util.removeClass(level, 'dropdown__menu--is-hidden dropdown__menu--left');
    });
  };

  var dropdown = document.getElementsByClassName('js-dropdown');
  if (dropdown.length > 0) {
    // init Dropdown objects
    for (var i = 0; i < dropdown.length; i++) {
      (function(i) {
        new Dropdown(dropdown[i]);
      })(i);
    }
  }
})();

(function() {
  var Submenu = function(element) {
    this.element = element;
    this.trigger = this.element.getElementsByClassName('nav-v2__link')[0];
    this.dropdown = this.element.getElementsByClassName('nav-v2__dropdown')[0];
    this.triggerFocus = false;
    this.dropdownFocus = false;
    this.hideInterval = false;
    this.prevFocus = false; // nested dropdown - store element that was in focus before focus changed
    initSubmenu(this);
    initNestedDropdown(this);
  };

  function initSubmenu(list) {
    initElementEvents(list, list.trigger);
    initElementEvents(list, list.dropdown);
  }

  function initElementEvents(list, element, bool) {
    element.addEventListener('focus', function() {
      bool = true;
      showDropdown(list);
    });
    element.addEventListener('focusout', function(event) {
      bool = false;
      hideDropdown(list, event);
    });
  }

  function showDropdown(list) {
    if (list.hideInterval) clearInterval(list.hideInterval);
    Util.addClass(list.dropdown, 'nav-v2__list--is-visible');
    resetDropdownStyle(list.dropdown, true);
  }

  function hideDropdown(list, event) {
    if (list.hideInterval) clearInterval(this.hideInterval);
    list.hideInterval = setTimeout(function() {
      var submenuFocus = document.activeElement.closest('.nav-v2__item--main'),
        inFocus = submenuFocus && submenuFocus == list.element;
      if (!list.triggerFocus && !list.dropdownFocus && !inFocus) {
        // hide if focus is outside submenu
        Util.removeClass(list.dropdown, 'nav-v2__list--is-visible');
        resetDropdownStyle(list.dropdown, false);
        hideSubLevels(list);
        list.prevFocus = false;
      }
    }, 100);
  }

  function initNestedDropdown(list) {
    var dropdownMenu = list.element.getElementsByClassName('nav-v2__list');
    for (var i = 0; i < dropdownMenu.length; i++) {
      var listItems = dropdownMenu[i].children;
      // bind hover
      new menuAim({
        menu: dropdownMenu[i],
        activate: function(row) {
          var subList = row.getElementsByClassName('nav-v2__dropdown')[0];
          if (!subList) return;
          Util.addClass(
            row.querySelector('a.nav-v2__link'),
            'nav-v2__link--hover'
          );
          showLevel(list, subList);
        },
        deactivate: function(row) {
          var subList = row.getElementsByClassName('nav-v2__dropdown')[0];
          if (!subList) return;
          Util.removeClass(
            row.querySelector('a.nav-v2__link'),
            'nav-v2__link--hover'
          );
          hideLevel(list, subList);
        },
        exitMenu: function() {
          return true;
        },
        submenuSelector: '.nav-v2__item--has-children'
      });
    }
    // store focus element before change in focus
    list.element.addEventListener('keydown', function(event) {
      if (
        (event.keyCode && event.keyCode == 9) ||
        (event.key && event.key == 'Tab')
      ) {
        list.prevFocus = document.activeElement;
      }
    });
    // make sure that sublevel are visible when their items are in focus
    list.element.addEventListener('keyup', function(event) {
      if (
        (event.keyCode && event.keyCode == 9) ||
        (event.key && event.key == 'Tab')
      ) {
        // focus has been moved -> make sure the proper classes are added to subnavigation
        var focusElement = document.activeElement,
          focusElementParent = focusElement.closest('.nav-v2__dropdown'),
          focusElementSibling = focusElement.nextElementSibling;

        // if item in focus is inside submenu -> make sure it is visible
        if (
          focusElementParent &&
          !Util.hasClass(focusElementParent, 'nav-v2__list--is-visible')
        ) {
          showLevel(list, focusElementParent);
        }
        // if item in focus triggers a submenu -> make sure it is visible
        if (
          focusElementSibling &&
          !Util.hasClass(focusElementSibling, 'nav-v2__list--is-visible')
        ) {
          showLevel(list, focusElementSibling);
        }

        // check previous element in focus -> hide sublevel if required
        if (!list.prevFocus) return;
        var prevFocusElementParent = list.prevFocus.closest(
            '.nav-v2__dropdown'
          ),
          prevFocusElementSibling = list.prevFocus.nextElementSibling;

        if (!prevFocusElementParent) return;

        // element in focus and element prev in focus are siblings
        if (
          focusElementParent &&
          focusElementParent == prevFocusElementParent
        ) {
          if (prevFocusElementSibling) hideLevel(list, prevFocusElementSibling);
          return;
        }

        // element in focus is inside submenu triggered by element prev in focus
        if (
          prevFocusElementSibling &&
          focusElementParent &&
          focusElementParent == prevFocusElementSibling
        )
          return;

        // shift tab -> element in focus triggers the submenu of the element prev in focus
        if (
          focusElementSibling &&
          prevFocusElementParent &&
          focusElementSibling == prevFocusElementParent
        )
          return;

        var focusElementParentParent = focusElementParent.parentNode.closest(
          '.nav-v2__dropdown'
        );

        // shift tab -> element in focus is inside the dropdown triggered by a siblings of the element prev in focus
        if (
          focusElementParentParent &&
          focusElementParentParent == prevFocusElementParent
        ) {
          if (prevFocusElementSibling) hideLevel(list, prevFocusElementSibling);
          return;
        }

        if (
          prevFocusElementParent &&
          Util.hasClass(prevFocusElementParent, 'nav-v2__list--is-visible')
        ) {
          hideLevel(list, prevFocusElementParent);
        }
      }
    });
  }

  function hideSubLevels(list) {
    var visibleSubLevels = list.dropdown.getElementsByClassName(
      'nav-v2__list--is-visible'
    );
    if (visibleSubLevels.length == 0) return;
    while (visibleSubLevels[0]) {
      hideLevel(list, visibleSubLevels[0]);
    }
    var hoveredItems = list.dropdown.getElementsByClassName(
      'nav-v2__link--hover'
    );
    while (hoveredItems[0]) {
      Util.removeClass(hoveredItems[0], 'nav-v2__link--hover');
    }
  }

  function showLevel(list, level, bool) {
    if (bool == undefined) {
      //check if the sublevel needs to be open to the left
      Util.removeClass(level, 'nav-v2__dropdown--nested-left');
      var boundingRect = level.getBoundingClientRect();
      if (
        window.innerWidth - boundingRect.right < 5 &&
        boundingRect.left + window.scrollX > 2 * boundingRect.width
      )
        Util.addClass(level, 'nav-v2__dropdown--nested-left');
    }
    Util.addClass(level, 'nav-v2__list--is-visible');
  }

  function hideLevel(list, level) {
    if (!Util.hasClass(level, 'nav-v2__list--is-visible')) return;
    Util.removeClass(level, 'nav-v2__list--is-visible');

    level.addEventListener('transition', function cb() {
      level.removeEventListener('transition', cb);
      Util.removeClass(level, 'nav-v2__dropdown--nested-left');
    });
  }

  var mainHeader = document.getElementsByClassName('js-header-v2');
  if (mainHeader.length > 0) {
    var menuTrigger = mainHeader[0].getElementsByClassName(
        'js-anim-menu-btn'
      )[0],
      firstFocusableElement = getMenuFirstFocusable();

    // we'll use these to store the node that needs to receive focus when the mobile menu is closed
    var focusMenu = false;

    menuTrigger.addEventListener('anim-menu-btn-clicked', function(event) {
      console.log(event.detail);
      // toggle menu visibility an small devices

      Util.toggleClass(
        document.getElementsByClassName('nav-v2')[0],
        'nav-v2--is-visible',
        event.detail
      );
      menuTrigger.setAttribute('aria-expanded', event.detail);
      if (event.detail) firstFocusableElement.focus();
      // move focus to first focusable element
      else if (focusMenu) {
        focusMenu.focus();
        focusMenu = false;
      }
    });

    // take care of submenu
    var mainList = mainHeader[0].getElementsByClassName('nav-v2__list--main');
    if (mainList.length > 0) {
      for (var i = 0; i < mainList.length; i++) {
        (function(i) {
          new menuAim({
            // use diagonal movement detection for main submenu
            menu: mainList[i],
            activate: function(row) {
              var submenu = row.getElementsByClassName('nav-v2__dropdown');
              if (submenu.length == 0) return;
              Util.addClass(submenu[0], 'nav-v2__list--is-visible');
              resetDropdownStyle(submenu[0], true);
            },
            deactivate: function(row) {
              var submenu = row.getElementsByClassName('nav-v2__dropdown');
              if (submenu.length == 0) return;
              Util.removeClass(submenu[0], 'nav-v2__list--is-visible');
              resetDropdownStyle(submenu[0], false);
            },
            exitMenu: function() {
              return true;
            },
            submenuSelector: '.nav-v2__item--has-children',
            submenuDirection: 'below'
          });

          // take care of focus event for main submenu
          var subMenu = mainList[i].getElementsByClassName(
            'nav-v2__item--main'
          );
          for (var j = 0; j < subMenu.length; j++) {
            (function(j) {
              if (Util.hasClass(subMenu[j], 'nav-v2__item--has-children'))
                new Submenu(subMenu[j]);
            })(j);
          }
        })(i);
      }
    }

    // if data-animation-offset is set -> check scrolling
    var animateHeader = mainHeader[0].getAttribute('data-animation');
    if (animateHeader && animateHeader == 'on') {
      var scrolling = false,
        scrollOffset = mainHeader[0].getAttribute('data-animation-offset')
          ? parseInt(mainHeader[0].getAttribute('data-animation-offset'))
          : 400,
        mainHeaderHeight = mainHeader[0].offsetHeight,
        mainHeaderWrapper = mainHeader[0].getElementsByClassName(
          'header-v2__wrapper'
        )[0];

      window.addEventListener('scroll', function(event) {
        if (!scrolling) {
          scrolling = true;
          !window.requestAnimationFrame
            ? setTimeout(function() {
                checkMainHeader();
              }, 250)
            : window.requestAnimationFrame(checkMainHeader);
        }
      });

      function checkMainHeader() {
        var windowTop = window.scrollY || document.documentElement.scrollTop;
        Util.toggleClass(
          mainHeaderWrapper,
          'header-v2__wrapper--is-fixed',
          windowTop >= mainHeaderHeight
        );
        Util.toggleClass(
          mainHeaderWrapper,
          'header-v2__wrapper--slides-down',
          windowTop >= scrollOffset
        );
        scrolling = false;
      }
    }

    // listen for key events
    window.addEventListener('keyup', function(event) {
      // listen for esc key
      if (
        (event.keyCode && event.keyCode == 27) ||
        (event.key && event.key.toLowerCase() == 'escape')
      ) {
        // close navigation on mobile if open
        if (
          menuTrigger.getAttribute('aria-expanded') == 'true' &&
          isVisible(menuTrigger)
        ) {
          focusMenu = menuTrigger; // move focus to menu trigger when menu is close
          menuTrigger.click();
        }
      }
      // listen for tab key
      if (
        (event.keyCode && event.keyCode == 9) ||
        (event.key && event.key.toLowerCase() == 'tab')
      ) {
        // close navigation on mobile if open when nav loses focus
        if (
          menuTrigger.getAttribute('aria-expanded') == 'true' &&
          isVisible(menuTrigger) &&
          !document.activeElement.closest('.js-header-v2')
        )
          menuTrigger.click();
      }
    });

    function getMenuFirstFocusable() {
      var focusableEle = mainHeader[0]
          .getElementsByClassName('nav-v2')[0]
          .querySelectorAll(
            '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'
          ),
        firstFocusable = false;
      for (var i = 0; i < focusableEle.length; i++) {
        if (
          focusableEle[i].offsetWidth ||
          focusableEle[i].offsetHeight ||
          focusableEle[i].getClientRects().length
        ) {
          firstFocusable = focusableEle[i];
          break;
        }
      }

      return firstFocusable;
    }
  }

  function resetDropdownStyle(dropdown, bool) {
    if (!bool) {
      dropdown.addEventListener('transitionend', function cb() {
        dropdown.removeAttribute('style');
        dropdown.removeEventListener('transitionend', cb);
      });
    } else {
      var boundingRect = dropdown.getBoundingClientRect();
      if (
        window.innerWidth - boundingRect.right < 5 &&
        boundingRect.left + window.scrollX > 2 * boundingRect.width
      ) {
        var left = parseFloat(
          window.getComputedStyle(dropdown).getPropertyValue('left')
        );
        dropdown.style.left =
          left + window.innerWidth - boundingRect.right - 5 + 'px';
      }
    }
  }

  function isVisible(element) {
    return (
      element.offsetWidth ||
      element.offsetHeight ||
      element.getClientRects().length
    );
  }
})();
