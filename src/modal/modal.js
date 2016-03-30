angular.module('ui.bootstrap.modal', ['ui.bootstrap.stackedMap'])
/**
 * A helper, internal data structure that stores all references attached to key
 */
  .factory('$$multiMap', function() {
    return {
      createNew: function() {
        var map = {};

        return {
          entries: function() {
            return Object.keys(map).map(function(key) {
              return {
                key: key,
                value: map[key]
              };
            });
          },
          get: function(key) {
            return map[key];
          },
          hasKey: function(key) {
            return !!map[key];
          },
          keys: function() {
            return Object.keys(map);
          },
          put: function(key, value) {
            if (!map[key]) {
              map[key] = [];
            }

            map[key].push(value);
          },
          remove: function(key, value) {
            var values = map[key];

            if (!values) {
              return;
            }

            var idx = values.indexOf(value);

            if (idx !== -1) {
              values.splice(idx, 1);
            }

            if (!values.length) {
              delete map[key];
            }
          }
        };
      }
    };
  })

/**
 * Pluggable resolve mechanism for the modal resolve resolution
 * Supports UI Router's $resolve service
 */
  .provider('$uibResolve', function() {
    var resolve = this;
    this.resolver = null;

    this.setResolver = function(resolver) {
      this.resolver = resolver;
    };

    this.$get = ['$injector', '$q', function($injector, $q) {
      var resolver = resolve.resolver ? $injector.get(resolve.resolver) : null;
      return {
        resolve: function(invocables, locals, parent, self) {
          if (resolver) {
            return resolver.resolve(invocables, locals, parent, self);
          }

          var promises = [];

          angular.forEach(invocables, function(value) {
            if (angular.isFunction(value) || angular.isArray(value)) {
              promises.push($q.resolve($injector.invoke(value)));
            } else if (angular.isString(value)) {
              promises.push($q.resolve($injector.get(value)));
            } else {
              promises.push($q.resolve(value));
            }
          });

          return $q.all(promises).then(function(resolves) {
            var resolveObj = {};
            var resolveIter = 0;
            angular.forEach(invocables, function(value, key) {
              resolveObj[key] = resolves[resolveIter++];
            });

            return resolveObj;
          });
        }
      };
    }];
  })

  /**
* Author: Rush SONG
* Description: modal window size resize directive
* Upgrade angular-ui-bootstrap to latest version
*/
.directive('modalResiable', function(){
  // Layout of popup window, buttons and labels are out of windows when narrowing.
      var runOnce = false;
      var activeResizable = function(elem, resize){
          resize = resize === 'true' ? true : false;
          if(resize && !runOnce){
            runOnce = true;
            elem.resizable({
                animate: true,
                animateDuration: 'normal',
                ghost: true,
                helper: "ui-resizable-helper"
            });
          }
      };

      return {
          restrict: 'A',
          require: ['?^ngModel'],
          link: function(scope, elem, attrs, ctrls){

                var resize = ctrls[0].$modelValue;

                scope.$watch(ctrls[0].$modelValue, function(){

                   resize = ctrls[0].$modelValue;
                   activeResizable(elem, resize);
                });

                activeResizable(elem, resize);
          }
      };
    //END
  })

  /**
* Author: Rush SONG
* Description: Modal window draggable feature for web ui
* Upgrade angular-ui-bootstrap to latest version
*/
.directive('modalDraggable', function(){
      return {
          restrict: 'A',
          compile: function(element, attrs, transclude) {
              return {
                  pre: function preLink(scope, element, attrs, controller) {
                  },
                  post: function postLink(scope, element, attrs, controller) {
                                var cssHandler = "div.modal-header";

                                element.draggable({
                                            handle: cssHandler,
                                            cursorAt:{cursor:"crosshair"},
                                            stop: function(event, ui){
                                                console.log("-----------------------------------------------------------------");
                                                // console.log(new Date());
                                                //get modal render offset
                                                var modalRenderOffset = $('div.modal-render').offset();
                                                var renderTop = modalRenderOffset.top;
                                                var renderLeft = modalRenderOffset.left;
                                                // get window visible width and height
                                                var w = $(window).width();
                                                var h = $(window).height();
                                                // console.log("The window visiable size is: [width: "+w+", height: "+h+"]");

                                                //get modal content offset
                                                var modalContentOffset = $('div.modal-content').offset();
                                                // console.log('modal content offset is: [top: '+ modalContentOffset.top+", left: "+modalContentOffset.left+"]");
                                                var modalWidth = $('div.modal-content').width();

                                                //get dialog offset
                                                var dlgOffset = $('div.modal-dialog').offset();
                                                var dlgOffsetLeft = modalContentOffset.left - dlgOffset.left;
                                                var dlgOffsetTop = modalContentOffset.top - dlgOffset.top;
                                                // console.log("current dialog static position is: [left: " + dlgOffsetLeft + ", top: " + dlgOffsetTop + "]");
                                                dlgOffsetLeft = parseInt(dlgOffsetLeft, 0);
                                                dlgOffsetTop = parseInt(dlgOffsetTop, 0);

                                                //get the distance between render window and modal dialog
                                                var distance = $('div.modal-dialog').offset().top - renderTop;
                                                // console.log("The distance is: "+ distance);

                                                //calculate the window current offset
                                                var winOffsetTop = dlgOffsetTop + dlgOffset.top;
                                                var winOffsetLeft = dlgOffsetLeft + dlgOffset.left;
                                                // console.log("Current window offset, left: " + winOffsetLeft + ", top: " + winOffsetTop);

                                                //get the scroll distance to top
                                                var scrollTop = $('div.modal-render').scrollTop();
                                                // console.log("current scroll top is:" + scrollTop);

                                                var fOffsetTop = winOffsetTop - modalRenderOffset.top + scrollTop;
                                                var fOffsetLeft = winOffsetLeft - modalRenderOffset.left;
                                                console.log('Current the absolute position is: [left:'+fOffsetLeft+", top: "+fOffsetTop+"]");

                                                var newOffsetTop = fOffsetTop < 0 ? 0 : fOffsetTop;

                                                var newOffsetLeft = fOffsetLeft >= w ? w - 10 : fOffsetLeft;
                                                if( newOffsetLeft < 0 && Math.abs( newOffsetLeft ) >= modalWidth ){
                                                    newOffsetLeft += 10;
                                                }

                                                //finall, calculate the offset
                                                newOffsetTop += renderTop;
                                                newOffsetLeft += renderLeft;
                                                $('div.modal-content').offset({
                                                    top: newOffsetTop,
                                                    left: newOffsetLeft
                                                });

                                                console.log("-----------------------------------------------------------------");
                                            }
                                           // containment: '.modal-backdrop'
                                  });
                                $('div.modal-header').css('cursor', 'move');

                                // Inline styles have the highest priority and will overwrite any other settings defined in a CSS file.
                                // Should give other modules chances to use their own styles. A direct consequence here is breaking the
                                // header background-color settings of angular-dialog-service, which results in all kinds of dialogs
                                // (error, confirm, etc.)have the same background color in header. The following changes have been moved
                                // to bootstrap.min.css.
                                // $('div.modal-header').css('padding', '10px');
                                // $('div.modal-header').css('background-color', '#eee');

                                var btnId = 'closeBtn' + Date.parse(new Date());
                                var closeIcon = "<button type=\"button\" id=\""+btnId+"\" style=\"background-color:inherit;\
                                width:20px;height:20px;border:none;position:relative;float:right;\
                                display: inline-block;\
                                text-align: center;\
                                text-decoration: none;\
                                padding: 0px 6px 0px 6px;\
                                font: bold 14px/25px Arial, sans-serif; \
                                text-shadow: 1px 1px 1px rgba(255,255,255, .22);\
                                -webkit-border-radius: 30px;\
                                -moz-border-radius: 30px;\
                                border-radius: 30px;\
                                -webkit-box-shadow: 1px 1px 1px rgba(0,0,0, .29), inset 1px 1px 1px rgba(255,255,255, .44);\
                                -moz-box-shadow: 1px 1px 1px rgba(0,0,0, .29), inset 1px 1px 1px rgba(255,255,255, .44);\
                                box-shadow: 1px 1px 1px rgba(0,0,0, .29), inset 1px 1px 1px rgba(255,255,255, .44);\
                                -webkit-transition: all 0.15s ease;\
                                -moz-transition: all 0.15s ease;\
                                -o-transition: all 0.15s ease;\
                                -ms-transition: all 0.15s ease;\
                                transition: all 0.15s ease;\
                                title=\"Close\"\
                                \"><font color=\"red\">&Chi;</font></button>";
                                var html = $(element[0]).html();
                                var closeButton = $(html).children('button.close');
                                if( angular.isDefined(closeButton.length) && closeButton.length === 0){
                                            $(element[0]).find('div.modal-header').prepend(closeIcon);
                                            var btnEl = $(element[0]).find('#'+btnId);
                                            $(btnEl).on('click',function(obj){
                                                if(scope.$parent.cancel){
                                                  scope.$parent.cancel();
                                                }else{
                                                  scope.$parent.$dismiss('Default cancel event..');
                                                }
                                            });

                                            $(btnEl).hover(function(){
                                                  $(this).css({
                                                        backgroundColor: "red"
                                                  });
													$(this).children().css({
														color: '#000000'
													});
                                            }, function(){
                                                  $(this).css({
                                                        backgroundColor: "inherit"
                                                  });
													$(this).children().css({
														color: 'red'
													});
                                            });
                                }
                  }
              };
          }
  };
})

/**
 * A helper directive for the $modal service. It creates a backdrop element.
 */
  .directive('uibModalBackdrop', ['$animate', '$injector', '$uibModalStack',
  function($animate, $injector, $modalStack) {
    return {
      replace: true,
      templateUrl: 'uib/template/modal/backdrop.html',
      compile: function(tElement, tAttrs) {
        tElement.addClass(tAttrs.backdropClass);
        return linkFn;
      }
    };

    function linkFn(scope, element, attrs) {
      if (attrs.modalInClass) {
        $animate.addClass(element, attrs.modalInClass);

        scope.$on($modalStack.NOW_CLOSING_EVENT, function(e, setIsAsync) {
          var done = setIsAsync();
          if (scope.modalOptions.animation) {
            $animate.removeClass(element, attrs.modalInClass).then(done);
          } else {
            done();
          }
        });
      }
    }
  }])

  .directive('uibModalWindow', ['$uibModalStack', '$q', '$animateCss', '$document',
  function($modalStack, $q, $animateCss, $document) {
    return {
      scope: {
        index: '@'
      },
      replace: true,
      transclude: true,
      templateUrl: function(tElement, tAttrs) {
        return tAttrs.templateUrl || 'uib/template/modal/window.html';
      },
      link: function(scope, element, attrs) {
        element.addClass(attrs.windowClass || '');
        element.addClass(attrs.windowTopClass || '');
        scope.size = attrs.size;

        //Upgrade angular-ui-bootstrap to latest version
        scope.width = attrs.mywidth;
        scope.height = attrs.myheight;
        // end
        //Layout of popup window, buttons and labels are out of windows when narrowing.

        scope.resize = attrs.resize;

        scope.closeAsStateChange = attrs.closeAsStateChange;
        //end

        scope.close = function(evt) {
          var modal = $modalStack.getTop();
          if (modal && modal.value.backdrop &&
            modal.value.backdrop !== 'static' &&
            evt.target === evt.currentTarget) {
            evt.preventDefault();
            evt.stopPropagation();
            $modalStack.dismiss(modal.key, 'backdrop click');
          }
        };

        /**
        * Author: Rush SONG
        *  Layout of popup window, buttons and labels are out of windows when narrowing.
        */
        if( angular.isDefined( scope.closeAsStateChange ) && scope.closeAsStateChange ){
            scope.$on('$stateChangeSuccess', function(obj, newState, oldState){
                var modal = $modalStack.getTop();
                if (modal) {
                  $modalStack.dismiss(modal.key, 'backdrop click');
                }
            });
        }

        /**
        * END
        */

       scope.autoResizeWindow = {};
        var isSizeEmpty = false;

        if( angular.isDefined( scope.width ) ){
             scope.autoResizeWindow.width = scope.width;
             isSizeEmpty = true;
        }

        if( angular.isDefined( scope.height ) ){
             scope.autoResizeWindow.height = scope.height;
             isSizeEmpty = true;
        }

        if( isSizeEmpty ){
          scope.size = undefined;
        }

        // moved from template to fix issue #2280
        element.on('click', scope.close);

        // This property is only added to the scope for the purpose of detecting when this directive is rendered.
        // We can detect that by using this property in the template associated with this directive and then use
        // {@link Attribute#$observe} on it. For more details please see {@link TableColumnResize}.
        scope.$isRendered = true;

        // Deferred object that will be resolved when this modal is render.
        var modalRenderDeferObj = $q.defer();
        // Observe function will be called on next digest cycle after compilation, ensuring that the DOM is ready.
        // In order to use this way of finding whether DOM is ready, we need to observe a scope property used in modal's template.
        attrs.$observe('modalRender', function(value) {
          if (value === 'true') {
            modalRenderDeferObj.resolve();
          }
        });

        modalRenderDeferObj.promise.then(function() {
          var animationPromise = null;

          if (attrs.modalInClass) {
            animationPromise = $animateCss(element, {
              addClass: attrs.modalInClass
            }).start();

            scope.$on($modalStack.NOW_CLOSING_EVENT, function(e, setIsAsync) {
              var done = setIsAsync();
              $animateCss(element, {
                removeClass: attrs.modalInClass
              }).start().then(done);
            });
          }


          $q.when(animationPromise).then(function() {
            // Notify {@link $modalStack} that modal is rendered.
            var modal = $modalStack.getTop();
            if (modal) {
              $modalStack.modalRendered(modal.key);
            }

            /**
             * If something within the freshly-opened modal already has focus (perhaps via a
             * directive that causes focus). then no need to try and focus anything.
             */
            if (!($document[0].activeElement && element[0].contains($document[0].activeElement))) {
              var inputWithAutofocus = element[0].querySelector('[autofocus]');
              /**
               * Auto-focusing of a freshly-opened modal element causes any child elements
               * with the autofocus attribute to lose focus. This is an issue on touch
               * based devices which will show and then hide the onscreen keyboard.
               * Attempts to refocus the autofocus element via JavaScript will not reopen
               * the onscreen keyboard. Fixed by updated the focusing logic to only autofocus
               * the modal element if the modal does not contain an autofocus element.
               */
              if (inputWithAutofocus) {
                inputWithAutofocus.focus();
              } else {
                element[0].focus();
              }
            }
          });
        });
      }
    };
  }])

  .directive('uibModalAnimationClass', function() {
    return {
      compile: function(tElement, tAttrs) {
        if (tAttrs.modalAnimation) {
          tElement.addClass(tAttrs.uibModalAnimationClass);
        }
      }
    };
  })

  .directive('uibModalTransclude', function() {
    return {
      link: function(scope, element, attrs, controller, transclude) {
        transclude(scope.$parent, function(clone) {
          element.empty();
          element.append(clone);
        });
      }
    };
  })

  .factory('$uibModalStack', ['$animate', '$animateCss', '$document',
    '$compile', '$rootScope', '$q', '$$multiMap', '$$stackedMap',
    function($animate, $animateCss, $document, $compile, $rootScope, $q, $$multiMap, $$stackedMap) {
      var OPENED_MODAL_CLASS = 'modal-open';

      var backdropDomEl, backdropScope;
      var openedWindows = $$stackedMap.createNew();
      var openedClasses = $$multiMap.createNew();
      var $modalStack = {
        NOW_CLOSING_EVENT: 'modal.stack.now-closing'
      };

      //Modal focus behavior
      var focusableElementList;
      var focusIndex = 0;
      var tababbleSelector = 'a[href], area[href], input:not([disabled]), ' +
        'button:not([disabled]),select:not([disabled]), textarea:not([disabled]), ' +
        'iframe, object, embed, *[tabindex], *[contenteditable=true]';

      function backdropIndex() {
        var topBackdropIndex = -1;
        var opened = openedWindows.keys();
        for (var i = 0; i < opened.length; i++) {
          if (openedWindows.get(opened[i]).value.backdrop) {
            topBackdropIndex = i;
          }
        }
        return topBackdropIndex;
      }

      $rootScope.$watch(backdropIndex, function(newBackdropIndex) {
        if (backdropScope) {
          backdropScope.index = newBackdropIndex;
        }
      });

      function removeModalWindow(modalInstance, elementToReceiveFocus) {
        var modalWindow = openedWindows.get(modalInstance).value;
        var appendToElement = modalWindow.appendTo;

        //clean up the stack
        openedWindows.remove(modalInstance);

        removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, function() {
          var modalBodyClass = modalWindow.openedClass || OPENED_MODAL_CLASS;
          openedClasses.remove(modalBodyClass, modalInstance);
          appendToElement.toggleClass(modalBodyClass, openedClasses.hasKey(modalBodyClass));
          toggleTopWindowClass(true);
        }, modalWindow.closedDeferred);
        checkRemoveBackdrop();

        //move focus to specified element if available, or else to body
        if (elementToReceiveFocus && elementToReceiveFocus.focus) {
          elementToReceiveFocus.focus();
        } else if (appendToElement.focus) {
          appendToElement.focus();
        }
      }

      // Add or remove "windowTopClass" from the top window in the stack
      function toggleTopWindowClass(toggleSwitch) {
        var modalWindow;

        if (openedWindows.length() > 0) {
          modalWindow = openedWindows.top().value;
          modalWindow.modalDomEl.toggleClass(modalWindow.windowTopClass || '', toggleSwitch);
        }
      }

      function checkRemoveBackdrop() {
        //remove backdrop if no longer needed
        if (backdropDomEl && backdropIndex() === -1) {
          var backdropScopeRef = backdropScope;
          removeAfterAnimate(backdropDomEl, backdropScope, function() {
            backdropScopeRef = null;
          });
          backdropDomEl = undefined;
          backdropScope = undefined;
        }
      }

      function removeAfterAnimate(domEl, scope, done, closedDeferred) {
        var asyncDeferred;
        var asyncPromise = null;
        var setIsAsync = function() {
          if (!asyncDeferred) {
            asyncDeferred = $q.defer();
            asyncPromise = asyncDeferred.promise;
          }

          return function asyncDone() {
            asyncDeferred.resolve();
          };
        };
        scope.$broadcast($modalStack.NOW_CLOSING_EVENT, setIsAsync);

        // Note that it's intentional that asyncPromise might be null.
        // That's when setIsAsync has not been called during the
        // NOW_CLOSING_EVENT broadcast.
        return $q.when(asyncPromise).then(afterAnimating);

        function afterAnimating() {
          if (afterAnimating.done) {
            return;
          }
          afterAnimating.done = true;

          $animate.leave(domEl).then(function() {
            domEl.remove();
            if (closedDeferred) {
              closedDeferred.resolve();
            }
          });

          scope.$destroy();
          if (done) {
            done();
          }
        }
      }

      $document.on('keydown', keydownListener);

      $rootScope.$on('$destroy', function() {
        $document.off('keydown', keydownListener);
      });

      function keydownListener(evt) {
        if (evt.isDefaultPrevented()) {
          return evt;
        }

        var modal = openedWindows.top();
        if (modal) {
          switch (evt.which) {
            case 27: {
              if (modal.value.keyboard) {
                evt.preventDefault();
                $rootScope.$apply(function() {
                  $modalStack.dismiss(modal.key, 'escape key press');
                });
              }
              break;
            }
            case 9: {
              $modalStack.loadFocusElementList(modal);
              var focusChanged = false;
              if (evt.shiftKey) {
                if ($modalStack.isFocusInFirstItem(evt) || $modalStack.isModalFocused(evt, modal)) {
                  focusChanged = $modalStack.focusLastFocusableElement();
                }
              } else {
                if ($modalStack.isFocusInLastItem(evt)) {
                  focusChanged = $modalStack.focusFirstFocusableElement();
                }
              }

              if (focusChanged) {
                evt.preventDefault();
                evt.stopPropagation();
              }
              break;
            }
          }
        }
      }

      $modalStack.open = function(modalInstance, modal) {
        var modalOpener = $document[0].activeElement,
          modalBodyClass = modal.openedClass || OPENED_MODAL_CLASS;

        toggleTopWindowClass(false);

        openedWindows.add(modalInstance, {
          deferred: modal.deferred,
          renderDeferred: modal.renderDeferred,
          closedDeferred: modal.closedDeferred,
          modalScope: modal.scope,
          backdrop: modal.backdrop,
          keyboard: modal.keyboard,
          openedClass: modal.openedClass,
          windowTopClass: modal.windowTopClass,
          animation: modal.animation,
          appendTo: modal.appendTo
        });

        openedClasses.put(modalBodyClass, modalInstance);

        var appendToElement = modal.appendTo,
            currBackdropIndex = backdropIndex();

        if (!appendToElement.length) {
          throw new Error('appendTo element not found. Make sure that the element passed is in DOM.');
        }

        if (currBackdropIndex >= 0 && !backdropDomEl) {
          backdropScope = $rootScope.$new(true);
          backdropScope.modalOptions = modal;
          backdropScope.index = currBackdropIndex;
          backdropDomEl = angular.element('<div uib-modal-backdrop="modal-backdrop"></div>');
          backdropDomEl.attr('backdrop-class', modal.backdropClass);
          if (modal.animation) {
            backdropDomEl.attr('modal-animation', 'true');
          }
          $compile(backdropDomEl)(backdropScope);
          $animate.enter(backdropDomEl, appendToElement);
        }

        var angularDomEl = angular.element('<div uib-modal-window="modal-window"></div>');
        angularDomEl.attr({
          'template-url': modal.windowTemplateUrl,
          'window-class': modal.windowClass,
          'window-top-class': modal.windowTopClass,
          'size': modal.size,
          'index': openedWindows.length() - 1,
          'animate': 'animate',
          //new added two parameter self-defined with and height with px
          'mywidth': modal.width,
          'myheight': modal.height,
          //end
          //if this set true, user can resize window
          'resize': modal.resize,
          'close-as-state-change': modal.closeAsStateChange
        }).html(modal.content);

        if (modal.animation) {
          angularDomEl.attr('modal-animation', 'true');
        }

        $animate.enter($compile(angularDomEl)(modal.scope), appendToElement)
          .then(function() {
            if (!modal.scope.$$uibDestructionScheduled) {
              $animate.addClass(appendToElement, modalBodyClass);
            }
          });

        openedWindows.top().value.modalDomEl = angularDomEl;
        openedWindows.top().value.modalOpener = modalOpener;

        $modalStack.clearFocusListCache();
      };

      function broadcastClosing(modalWindow, resultOrReason, closing) {
        return !modalWindow.value.modalScope.$broadcast('modal.closing', resultOrReason, closing).defaultPrevented;
      }

      $modalStack.close = function(modalInstance, result) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow && broadcastClosing(modalWindow, result, true)) {
          modalWindow.value.modalScope.$$uibDestructionScheduled = true;
          modalWindow.value.deferred.resolve(result);
          removeModalWindow(modalInstance, modalWindow.value.modalOpener);
          return true;
        }
        return !modalWindow;
      };

      $modalStack.dismiss = function(modalInstance, reason) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow && broadcastClosing(modalWindow, reason, false)) {
          modalWindow.value.modalScope.$$uibDestructionScheduled = true;
          modalWindow.value.deferred.reject(reason);
          removeModalWindow(modalInstance, modalWindow.value.modalOpener);
          return true;
        }
        return !modalWindow;
      };

      $modalStack.dismissAll = function(reason) {
        var topModal = this.getTop();
        while (topModal && this.dismiss(topModal.key, reason)) {
          topModal = this.getTop();
        }
      };

      $modalStack.getTop = function() {
        return openedWindows.top();
      };

      $modalStack.modalRendered = function(modalInstance) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow) {
          modalWindow.value.renderDeferred.resolve();
        }
      };

      $modalStack.focusFirstFocusableElement = function() {
        if (focusableElementList.length > 0) {
          focusableElementList[0].focus();
          return true;
        }
        return false;
      };
      $modalStack.focusLastFocusableElement = function() {
        if (focusableElementList.length > 0) {
          focusableElementList[focusableElementList.length - 1].focus();
          return true;
        }
        return false;
      };

      $modalStack.isModalFocused = function(evt, modalWindow) {
        if (evt && modalWindow) {
          var modalDomEl = modalWindow.value.modalDomEl;
          if (modalDomEl && modalDomEl.length) {
            return (evt.target || evt.srcElement) === modalDomEl[0];
          }
        }
        return false;
      };

      $modalStack.isFocusInFirstItem = function(evt) {
        if (focusableElementList.length > 0) {
          return (evt.target || evt.srcElement) === focusableElementList[0];
        }
        return false;
      };

      $modalStack.isFocusInLastItem = function(evt) {
        if (focusableElementList.length > 0) {
          return (evt.target || evt.srcElement) === focusableElementList[focusableElementList.length - 1];
        }
        return false;
      };

      $modalStack.clearFocusListCache = function() {
        focusableElementList = [];
        focusIndex = 0;
      };

      $modalStack.loadFocusElementList = function(modalWindow) {
        if (focusableElementList === undefined || !focusableElementList.length) {
          if (modalWindow) {
            var modalDomE1 = modalWindow.value.modalDomEl;
            if (modalDomE1 && modalDomE1.length) {
              focusableElementList = modalDomE1[0].querySelectorAll(tababbleSelector);
            }
          }
        }
      };

      return $modalStack;
    }])

  .provider('$uibModal', function() {
    var $modalProvider = {
      options: {
        animation: true,
        backdrop: true, //can also be false or 'static'
        keyboard: true
      },
      $get: ['$rootScope', '$q', '$document', '$templateRequest', '$controller', '$uibResolve', '$uibModalStack',
        function ($rootScope, $q, $document, $templateRequest, $controller, $uibResolve, $modalStack) {
          var $modal = {};

          function getTemplatePromise(options) {
            return options.template ? $q.when(options.template) :
              $templateRequest(angular.isFunction(options.templateUrl) ?
                options.templateUrl() : options.templateUrl);
          }

          var promiseChain = null;
          $modal.getPromiseChain = function() {
            return promiseChain;
          };

          /**
           * @author jiqings
           * @description set the configs if not set in config options
           * */
          function defaultConfigs(modalOptions){
              if( angular.isUndefined(modalOptions.keyboard) ){
                  modalOptions.keyboard = false;
              }

              if( angular.isUndefined(modalOptions.backdrop) ){
                  modalOptions.backdrop = 'static';
              }

              if( angular.isUndefined(modalOptions.size) ){
                  modalOptions.size = 'lg';
              }

              if( angular.isUndefined( modalOptions.resize ) ){
                //set default value to false
                modalOptions.resize = false;
              }

              if( angular.isUndefined( modalOptions.closeAsStateChange ) ){
                //set default value to true, the ui-route state change successful, modal window will be closed
                modalOptions.closeAsStateChange = true;
              }
          }
          //end

          $modal.open = function(modalOptions) {
             //set default configs
            defaultConfigs(modalOptions);
            //end
            var modalResultDeferred = $q.defer();
            var modalOpenedDeferred = $q.defer();
            var modalClosedDeferred = $q.defer();
            var modalRenderDeferred = $q.defer();

            //prepare an instance of a modal to be injected into controllers and returned to a caller
            var modalInstance = {
              result: modalResultDeferred.promise,
              opened: modalOpenedDeferred.promise,
              closed: modalClosedDeferred.promise,
              rendered: modalRenderDeferred.promise,
              close: function (result) {
                return $modalStack.close(modalInstance, result);
              },
              dismiss: function (reason) {
                return $modalStack.dismiss(modalInstance, reason);
              }
            };

            //merge and clean up options
            modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
            modalOptions.resolve = modalOptions.resolve || {};
            modalOptions.appendTo = modalOptions.appendTo || $document.find('body').eq(0);

            //verify options
            if (!modalOptions.template && !modalOptions.templateUrl) {
              throw new Error('One of template or templateUrl options is required.');
            }

            var templateAndResolvePromise =
              $q.all([getTemplatePromise(modalOptions), $uibResolve.resolve(modalOptions.resolve, {}, null, null)]);

            function resolveWithTemplate() {
              return templateAndResolvePromise;
            }

            // Wait for the resolution of the existing promise chain.
            // Then switch to our own combined promise dependency (regardless of how the previous modal fared).
            // Then add to $modalStack and resolve opened.
            // Finally clean up the chain variable if no subsequent modal has overwritten it.
            var samePromise;
            samePromise = promiseChain = $q.all([promiseChain])
              .then(resolveWithTemplate, resolveWithTemplate)
              .then(function resolveSuccess(tplAndVars) {
                var providedScope = modalOptions.scope || $rootScope;

                var modalScope = providedScope.$new();
                modalScope.$close = modalInstance.close;
                modalScope.$dismiss = modalInstance.dismiss;

                modalScope.$on('$destroy', function() {
                  if (!modalScope.$$uibDestructionScheduled) {
                    modalScope.$dismiss('$uibUnscheduledDestruction');
                  }
                });

                var ctrlInstance, ctrlInstantiate, ctrlLocals = {};

                //controllers
                if (modalOptions.controller) {
                  ctrlLocals.$scope = modalScope;
                  ctrlLocals.$uibModalInstance = modalInstance;
                  angular.forEach(tplAndVars[1], function(value, key) {
                    ctrlLocals[key] = value;
                  });

                  // the third param will make the controller instantiate later,private api
                  // @see https://github.com/angular/angular.js/blob/master/src/ng/controller.js#L126
                  ctrlInstantiate = $controller(modalOptions.controller, ctrlLocals, true);
                  if (modalOptions.controllerAs) {
                    ctrlInstance = ctrlInstantiate.instance;

                    if (modalOptions.bindToController) {
                      ctrlInstance.$close = modalScope.$close;
                      ctrlInstance.$dismiss = modalScope.$dismiss;
                      angular.extend(ctrlInstance, providedScope);
                    }

                    ctrlInstance = ctrlInstantiate();

                    modalScope[modalOptions.controllerAs] = ctrlInstance;
                  } else {
                    ctrlInstance = ctrlInstantiate();
                  }

                  if (angular.isFunction(ctrlInstance.$onInit)) {
                    ctrlInstance.$onInit();
                  }
                }

                $modalStack.open(modalInstance, {
                  scope: modalScope,
                  deferred: modalResultDeferred,
                  renderDeferred: modalRenderDeferred,
                  closedDeferred: modalClosedDeferred,
                  content: tplAndVars[0],
                  animation: modalOptions.animation,
                  backdrop: modalOptions.backdrop,
                  keyboard: modalOptions.keyboard,
                  backdropClass: modalOptions.backdropClass,
                  windowTopClass: modalOptions.windowTopClass,
                  windowClass: modalOptions.windowClass,
                  windowTemplateUrl: modalOptions.windowTemplateUrl,
                  size: modalOptions.size,
                  openedClass: modalOptions.openedClass,
                  appendTo: modalOptions.appendTo,
                  //OUpgrade angular-ui-bootstrap to latest version
                width: modalOptions.width,
                height: modalOptions.height,
                //end
                //Layout of popup window, buttons and labels are out of windows when narrowing.
                resize: modalOptions.resize,
                closeAsStateChange: modalOptions.closeAsStateChange
                //END
                });
                modalOpenedDeferred.resolve(true);

            }, function resolveError(reason) {
              modalOpenedDeferred.reject(reason);
              modalResultDeferred.reject(reason);
            })['finally'](function() {
              if (promiseChain === samePromise) {
                promiseChain = null;
              }
            });

            return modalInstance;
          };

          return $modal;
        }
      ]
    };

    return $modalProvider;
  });
