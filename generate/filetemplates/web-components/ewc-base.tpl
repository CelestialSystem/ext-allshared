//{now}
{import}
import {
    doProp,
    filterProp,
    isMenu,
    isRenderercell,
    isParentGridAndChildColumn,
    isTooltip,
    isPlugin
} from './util.js';

export default class EwcBaseComponent extends HTMLElement {

    constructor(properties, events) {
        super ();

        var props = ['text','align','title','extname','height','width','columns','data','layout','flex']
        props.forEach( prop =>
            {
                doProp(this,prop)
            }
        )
        this.properties = props;

        // const distinct = (value, index, self) => {
        //     return self.indexOf(value) === index;
        // }
        // var p2 = properties.filter(distinct);
        // p2.forEach( prop =>
        //     {
        //         //console.log(prop)
        //         //doProp(this,prop)
        //     }
        // )
        // this.properties = p2;

        //properties.forEach( prop => doProp(this,prop))
        //this.properties = properties;

        //this.methods = methods;
        this.events = events;
    }
    connectedCallback() {
        EwcBaseComponent.elementcount++;
        console.log('added: ' + this.tagName + ': elementcount is now ' + EwcBaseComponent.elementcount);
        EwcBaseComponent.elements.push(this);

        this.A = {};
        this.A.CHILDREN = [];
        this.A.o = {}

        //console.log(this.children)
        for (let child of this.children) {
            //console.dir(child)
            if (child.nodeName.substring(0, 4) !== 'EXT-') {
                //console.log(child);
                var el = Ext.get(child);
                var w = Ext.create({xtype:'widget', element: el});
                this.A.CHILDREN.push(w);
            }
        }
                this.base = EwcBaseComponent;

        //this.properties = []
        //for (var property in this.propertiesobject) {
        //    this.properties.push(property)
        //}

        // this.newDiv = document.createElement('div');
        // //var textnode = document.createTextNode(this.xtype);
        // //this.newDiv.appendChild(textnode)
        // this.insertAdjacentElement('beforebegin', this.newDiv);
    }

    parsedCallback() {
        this.initMe()
    }

{basecode}
{propscode}

    setEvent(eventparameters,o, me3) {
        o.listeners[eventparameters.name] = function() {
            let eventname = eventparameters.name
            //console.log('in event: ' + eventname + ' ' + o.xtype)
            let parameters = eventparameters.parameters;
            let parms = parameters.split(',');
            let args = Array.prototype.slice.call(arguments);
            let event = {};
            for (let i = 0, j = parms.length; i < j; i++ ) {
                event[parms[i]] = args[i];
            }
            me3.dispatchEvent(new CustomEvent(eventname,{detail: event}))
        }
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        if (/^on/.test(attr)) {
            if (newVal) {
            this.addEventListener(attr.slice(2), function(event) {
                var functionString = newVal;
                // todo: error check for only 1 dot
                var r = functionString.split('.');
                var obj = r[0];
                var func = r[1];
                if (obj && func) {
                window[obj][func](event);
                }
            });
            } else {
            //delete this[attr];
            //this.removeEventListener(attr.slice(2), this);
            }
        } else {

            var ischanged
            if (this.A) {
                if (this.A.ext != undefined) {
                    ischanged = true
                    var method = 'set' + attr[0].toUpperCase() + attr.substring(1)
                    if (method != 'setExtname') {
                        console.log(method)
                        this.A.ext[method](newVal)
                    }
                }
                else {
                    ischanged = false
                }
            }
            //console.log('attr: ' + attr + ', changed is ' + ischanged)

            //if (this.A.ext === undefined) {
            //    //mjg ??
            //}
            //else {
            //    //mjg check if this method exists for this component
            //    var method = 'set' + attr[0].toUpperCase() + attr.substring(1)
            //    this.A.ext[method](newVal)
            //}
        }
    }

    extendObject(obj, src) {
        if (obj == undefined) {obj = {}}
        for (var key in src) {
            if (src.hasOwnProperty(key)) obj[key] = src[key];
        }
        return obj;
    }

    extendArray(obj, src) {
        if (obj == undefined) {obj = []}
        Array.prototype.push.apply(obj,src);
        return obj;
    }

    filterProperty(propertyValue) {
        try {
            const parsedProp = JSON.parse(propertyValue);

            if (parsedProp === null ||
                parsedProp === undefined ||
                parsedProp === true ||
                parsedProp === false ||
                parsedProp === Object(parsedProp) ||
                (!isNaN(parsedProp) && parsedProp !== 0)
            ) {
                return parsedProp;
            } else {
                return propertyValue;
            }
        }
        catch(e) {
            return propertyValue;
        }
    }

    disconnectedCallback() {
        //console.log('ExtBase disconnectedCallback ' + this.A.ext.xtype)
        delete this.A.ext
    }

}

EwcBaseComponent.elementcount = 0;
EwcBaseComponent.elements = [];
EwcBaseComponent.elementsprior = [];

EwcBaseComponent.isLoading = false;
EwcBaseComponent.isDone = false;

EwcBaseComponent.count = 0;
EwcBaseComponent.DIRECTION = '';

//EwcBaseComponent.getCmp = function getCmp(event, value) {
//    var array = event.detail.allCmp;
//    for (var i = 0; i < array.length; i++) {
//        if (array[i]['extname'] === value) {
//        return array[i].ext;
//        }
//    }
//    return null;
//};


//EwcBaseComponent.extendArray = function(obj, src) {
//    if (obj == undefined) {obj = []}
//    Array.prototype.push.apply(obj,src);
//    return obj;
//}
