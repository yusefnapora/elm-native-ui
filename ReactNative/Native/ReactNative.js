Elm.Native.ReactNative = {};
Elm.Native.ReactNative.make = function(localRuntime) {
    localRuntime.Native = localRuntime.Native || {};
    localRuntime.Native.ReactNative = localRuntime.Native.ReactNative || {};
    if (localRuntime.Native.ReactNative.values) {
        return localRuntime.Native.ReactNative.values;
    }

    if ((typeof localRuntime.node.reactEnvironment !== 'object') ||
      (typeof localRuntime.node.reactEnvironment.React !== 'object'))
    {
      throw new Error("The Elm runtime was not intialized correctly!\n" +
        "Please use Elm.embedReact() to initialize the runtime.");
    }
    var reactEnvironment = localRuntime.node.reactEnvironment;
    var React = reactEnvironment.React;

    var Json = Elm.Native.Json.make(localRuntime);
    var Signal = Elm.Native.Signal.make(localRuntime);
    var List = Elm.Native.List.make(localRuntime);

    function node(name)
    {
      return F2(function(propertyList, contents) {
        return makeNode(name, propertyList, contents);
      });
    }

    function getNested(obj, path) {
      if (typeof(obj) !== 'object' || typeof(path) !== 'string') {
        return undefined;
      }
      let pathComponents = path.split('.');
      while (typeof(obj) === 'object') {
        let p = pathComponents.shift();
        obj = obj[p];
      }
      return obj;
    }


    function makeNode(name, propertyList, contents)
    {
      var props = listToProperties(propertyList);
      var reactClass = getNested(reactEnvironment, name);
      return React.createElement(reactClass, props, List.toArray(contents));
    }

    function stringNode(string) {
      return string;
    }

    function listToProperties(list)
  	{
  		var object = {};
  		while (list.ctor !== '[]')
  		{
  			var entry = list._0;
  			object[entry.key] = entry.value;
  			list = list._1;
  		}
  		return object;
  	}

    // PROPERTIES
    function property(key, value)
  	{
  		return {
  			key: key,
  			value: value
  		};
  	}

    // EVENTS
    function eventHandler(name, decoder, createMessage)
    {
      function handler(event)
      {
        var value = A2(Json.runDecoderValue, decoder, event);
        if (value.ctor === 'Ok')
        {
          Signal.sendMessage(createMessage(value._0))
        }
      }
      return property(name, handler);
    }

    function on(name, decoder, createMessage)
    {
      // ReactNative uses onCamelCase style, so we capitalize the first letter
      var propName = 'on' + name.charAt(0).toUpperCase() + name.slice(1);
      return eventHandler(propName, decoder, createMessage);
    }


    // RENDERING
    function render(vtree) {
      // render just returns its input.
      // During the initial render, the elm runtime will set the state of
      // the container react element to the output of this render function.
      return vtree;
    }

    function setReactVTree(reactElement, vtree) {
			var newState = Object.assign({},
				reactElement.state,
				{_elmVTree: vtree}
			);

      console.info('updating vtree: ', vtree);
			reactElement.setState(newState);
		}

    function updateAndReplace(containerElement, oldVTree, newVTree) {
      setReactVTree(containerElement, newVTree);
    }


    localRuntime.Native.ReactNative.values = {
        node: node,
        stringNode: stringNode,
        eventHandler: F3(eventHandler),
        on: F3(on),
        property: F2(property),
        render: render,
        updateAndReplace: updateAndReplace
    };
    return localRuntime.Native.ReactNative.values;
};
