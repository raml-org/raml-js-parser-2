// Compiled using typings@0.3.3
// Source: custom_typings/react-pure-render.d.ts
declare module 'react-pure-render/function' {
  function shouldPureComponentUpdate (nextProps: any, nextState: any): boolean;

  export = shouldPureComponentUpdate;
}

declare module 'react-pure-render/component' {
  import React = require('react')

  class PureComponent<P, S> extends React.Component<P, S> {}

  export = PureComponent;
}

declare module 'react-pure-render/mixin' {
  interface PureComponentMixin {
    shouldComponentUpdate (nextProps: any, nextState: any): boolean;
  }

  export = PureComponentMixin;
}

declare module 'react-pure-render/shallowEqual' {
  function shallowEqual (objA: any, objB: any): boolean;

  export = shallowEqual;
}

declare module 'react-pure-render' {
  export import shallowEqual = require('react-pure-render/shallowEqual');
  export import shouldPureComponentUpdate = require('react-pure-render/function');
  export import PureComponent = require('react-pure-render/component');
  export import PureMixin = require('react-pure-render/mixin');
}