// @flow
import type { Position } from 'css-box-model';
// import rafSchd from 'raf-schd';
import { invariant } from '../invariant';
import bindEvents from './event-bindings/bind-events';
import type { EventBinding } from './event-bindings/event-types';
// import getWindowScroll from './window/get-window-scroll';
import { noop } from '../empty';

type OnWindowViewportScroll = (newScroll: Position) => void;

type Args = {|
  onWindowViewportScroll: OnWindowViewportScroll,
|};

type Result = {|
  start: () => void,
  stop: () => void,
  isActive: () => boolean,
|};

function getWindowViewportScrollBinding(update: () => void): EventBinding {
  return {
    eventName: 'dndViewportScroll',
    // ## Passive: true
    // Eventual consistency is fine because we use position: fixed on the item
    // ## Capture: false
    // Scroll events on elements do not bubble, but they go through the capture phase
    // https://twitter.com/alexandereardon/status/985994224867819520
    // Using capture: false here as we want to avoid intercepting droppable scroll requests
    options: { passive: true, capture: false },
    fn: (event: UIEvent) => {
      // IE11 fix
      // All scrollable events still bubble up and are caught by this handler in ie11.
      // On a window scroll the event.target should be the window or the document.
      // If this is not the case then it is not a 'window' scroll event and can be ignored
      if (event.target !== window && event.target !== window.document) {
        return;
      }

      update({x: event.detail.x, y: event.detail.y});
    },
  };
}

export default function getViewportScrollListener({ onWindowViewportScroll }: Args): Result {
  function updateScroll(scroll) {
    onWindowViewportScroll(scroll);
  }

  // const scheduled = rafSchd(updateScroll);
  // const binding: EventBinding = getWindowScrollBinding(scheduled);
  const binding: EventBinding = getWindowViewportScrollBinding(updateScroll);
  let unbind: () => void = noop;

  function isActive(): boolean {
    return unbind !== noop;
  }

  function start() {
    invariant(!isActive(), 'Cannot start scroll listener when already active');
    unbind = bindEvents(window, [binding]);
  }
  function stop() {
    invariant(isActive(), 'Cannot stop scroll listener when not active');
    // scheduled.cancel();
    unbind();
    unbind = noop;
  }

  return { start, stop, isActive };
}
