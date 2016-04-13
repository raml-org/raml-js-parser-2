/// <reference path="../../typings/main.d.ts" />

/**
 * Exported API.
 */
export interface Sanitize {
    (parameters: Raml08Parser.NamedParameterMap): (value: ParameterValueMap ) => any

    rule: (parameter: Raml08Parser.NamedParameter) => any

    RULES: RulesObject
    TYPES: TypesObject
}

function isEmpty (value: any): boolean {
    return value == null
}

function toString (value: any): string {
    return isEmpty(value) ? '' : String(value)
}

function toBoolean (value: any): boolean {
    return [0, false, '', '0', 'false'].indexOf(value) === -1
}

function toNumber (value: any): number | void {
    return isFinite(value) ? Number(value) : null
}

function toInteger (value: any): number | void {
    return value % 1 === 0 ? Number(value) : null
}

function toDate (value: any): Date | void {
    return !isNaN(Date.parse(value)) ? new Date(value) : null
}

export type ParameterValueMap = { [parameterName: string]: any }

export type SanitizeFunction = (check: any, key?: string, src?: ParameterValueMap) => any
export type RuleFunction = (rule: any, key: string) => SanitizeFunction

export type RulesObject = { [rule: string]: RuleFunction }
export type TypesObject = { [rule: string]: SanitizeFunction }

function toSanitization (parameter: Raml08Parser.NamedParameter, rules: RulesObject, types: TypesObject) {
    var parameters = Array.isArray(parameter) ? <Array<Raml08Parser.BasicNamedParameter>>parameter : [parameter]

    var sanitizations = parameters.map(function (parameter) {
        var fns = []
        var typeSanitization = types[parameter.type]

        if (typeof typeSanitization === 'function') {
            fns.push(typeSanitization)
        }

        Object.keys(parameter)
            .filter(function (key) {
                return key !== 'type' && key !== 'repeat' && key !== 'default';
            })
            .forEach(function (key) {
                var fn = rules[key]

                if (typeof fn === 'function') {
                    fns.push(fn(parameter[key], key))
                }
            })

        function sanitize (value: any, key: string, src: ParameterValueMap) {
            for (var i = 0; i < fns.length; i++) {
                var fn = fns[i]
                var value = fn(value, key, src)

                if (value != null) {
                    return value
                }
            }

            return null
        }

        return function (value: any, key: string, src: ParameterValueMap) {
            if (isEmpty(value)) {
                if (parameter.default != null) {
                    return sanitize(parameter.default, key, src)
                }

                return parameter.repeat && !parameter.required ? [] : value
            }

            if (parameter.repeat) {
                var values = Array.isArray(value) ? value : [value]

                values = values.map(function (value) {
                    return sanitize(value, key, src)
                })

                return values.some(isEmpty) ? null : value
            }

            if (Array.isArray(value)) {
                if (value.length > 1) {
                    return null
                }

                value = value[0]
            }

            return sanitize(value, key, src)
        }
    })

    return function (value: any, key: string, src: ParameterValueMap): any {
        for (var i = 0; i < sanitizations.length; i++) {
            var sanitization = sanitizations[i]
            var result = sanitization(value, key, src)

            if (result != null) {
                return result
            }
        }

        return value
    }
}

export function sanitize () {

    var RULES: RulesObject = {}

    var TYPES: TypesObject = {
        string: toString,
        number: toNumber,
        integer: toInteger,
        boolean: toBoolean,
        date: toDate
    }

    function rule (parameter: Raml08Parser.NamedParameter): SanitizeFunction {
        return toSanitization(parameter, RULES, TYPES)
    }

    var sanitize: any = function (parameterMap: Raml08Parser.NamedParameterMap) {
        if (!parameterMap) {
            return function () {
                return {}
            }
        }

        var sanitizations = {}

        Object.keys(parameterMap).forEach(function (key) {
            sanitizations[key] = sanitize.rule(parameterMap[key])
        })

        return function (src?: ParameterValueMap): ParameterValueMap {
            src = src || {}

            var dest: ParameterValueMap = {}

            // Iterate the sanitized parameters to get a clean model.
            Object.keys(sanitizations).forEach(function (key) {
                var value = src[key]
                var fn = sanitizations[key]

                if (Object.prototype.hasOwnProperty.call(src, key)) {
                    dest[key] = fn(value, key, src)
                }
            })

            return dest
        }
    }

    var s: Sanitize

    s = sanitize
    s.rule = rule
    s.TYPES = TYPES
    s.RULES = RULES

    return s
}

// export = sanitize