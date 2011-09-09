var DataBindr = DataBindr || {};

DataBindr.Model = (function () {

var Model = (function() {
    
    var getValue = function(obj, name) {
        return obj[ "_" + name ];
    };

    var setValue = function(obj, name, value) {
        obj[ "_" + name ] = value;
        return value;
    };

    var wrapProperty = function(name) {
        var changeListeners = [];
        
        var gettersetter = function(value) {
            var i,
                returnValue;
            //getter
            if(arguments.length === 0) {
                return getValue(this, name);
            }
            //setter
            else {
                returnValue = setValue(this, name, value);

                for(i = 0; i < changeListeners.length; ++i) {
                    changeListeners[i].call( this, value );
                }

                return returnValue;
            }
        };
        
        gettersetter.onchange = function(l) {
            changeListeners.push(l);
        };
        
        return gettersetter;
    };
    
    var modelCtor = function(inheritFrom, props) {
        var modelType = function() {},
            key,
			value;
        
        if(!props) {
            props = inheritFrom;
            inheritFrom = undefined;
        }
        
        if(!inheritFrom) {
            inheritFrom = Model;
        }
        modelType.prototype = Object.create( inheritFrom.prototype );
        
        for(key in props) {
            if(props.hasOwnProperty( key )) {
				value = props[ key ];
				//don't wrap functions, just add them as is to the prototype
				if(typeof value === "function") {
					modelType.prototype[ key ] = value;
				} else {
					//make a getter/setter function with an onchange event
					modelType.prototype[ key ] = wrapProperty( key );
					//set default value on prototype
	                setValue(modelType.prototype, key, props[ key ]);	
				}            
            }
        }
        
        return modelType;
    };
    
    return modelCtor;
}());

Model.prototype.forEach = function(func) {
    var key,
        proto = Object.getPrototypeOf( this ),
        gettersetter,
        value;
    for(key in proto) {
        if(proto.hasOwnProperty( key )) {
            gettersetter = proto[ key ];
            if(typeof gettersetter === "function") {
                func.call( this, key, gettersetter );
            }
        }
    }
};

Model.prototype.set = function(props) {
    this.forEach(function(key, gettersetter) {
        if( props.hasOwnProperty( key ) ) {
            gettersetter.call(this, props[ key ]);
        }
    });
};

Model.prototype.simplify = function() {
    var result = {};
    
    this.forEach(function(key, gettersetter) {
        var value = gettersetter.call( this );
        result[ key ] = value;
    });
    
    return result;
};

return Model;

}());