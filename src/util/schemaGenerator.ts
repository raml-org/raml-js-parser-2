/**
 * Created by Sviridov on 5/1/2015.
 */

export class JsonSchemaGenerator {

    generateSchema(obj:any):Object{

        var sch:Object = {}
        sch['required'] = true
        sch['$schema'] = 'http://json-schema.org/draft-03/schema'

        this.pass(obj, sch);
        return sch
    }

    private pass(value:any, property:Object){

        var valueType:string = this.detectType(value);
        property['type'] = valueType
        if (!value || value == null) {

        }
        else if (Array.isArray(value)) {
            this.passArray(value, property);
        }
        else if (value instanceof Object) {
            this.passObject(value, property);
        }
    }

    private passObject(obj:Object, sch:Object) {
        Object.keys(obj).forEach( x => this.registerProperty(x,obj[x],sch) )
    }

    private registerProperty(propName:string, value:any, sch:Object){

        var properties:Object = sch['properties']
        if(!properties){
            properties = {}
            sch['properties'] = properties
        }

        var property:Object = properties[propName]
        if(!property){
            property = {}
            properties[propName] = property
        }
        property['required'] = false
        this.pass(value, property);
    }

    private passArray(array:any[], property:Object){

        var items = property['items']
        if(!items){
            items = []
            property['items'] = items
        }

        var l:number = array.length;
        var itemSet = []
        array.forEach( value => {

            var item:Object = {}
            this.pass(value,item);
            itemSet.push(item)
        })
        items.push(itemSet[0])
    }

    private detectType(value:any):string {
        if(Array.isArray(value)) {
            return 'array'
        }
        return typeof value
    }
}
export function generateSchema(text:string,mediaType:string):string{
    var generator = new JsonSchemaGenerator()
    var obj = JSON.parse(text);
    var schemaObject = generator.generateSchema(obj)
    var schemaString = JSON.stringify(schemaObject,null,2)
    return schemaString
}