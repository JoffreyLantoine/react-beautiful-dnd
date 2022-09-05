// @flow
import type { Position } from 'css-box-model';
import { moveByWindowScroll } from '../action-creators';
import type { MiddlewareStore, Action, Dispatch } from '../store-types';
import getViewportScrollListener from '../../view/viewport-scroll-listener';

// TODO: this is taken from auto-scroll. Let's make it a util
const shouldEnd = (action: Action): boolean =>
  action.type === 'DROP_COMPLETE' ||
  action.type === 'DROP_ANIMATE' ||
  action.type === 'FLUSH';

export default (store: MiddlewareStore) => {
  const listener = getViewportScrollListener({
    onWindowViewportScroll: (newScroll: Position) => {
      store.dispatch(moveByWindowScroll({ newScroll }));
    },
  });

  return (next: Dispatch) => (action: Action): any => {
    if (!listener.isActive() && action.type === 'INITIAL_PUBLISH') {
      listener.start();
    }

    if (listener.isActive() && shouldEnd(action)) {
      listener.stop();
    }

    next(action);
  };
};
