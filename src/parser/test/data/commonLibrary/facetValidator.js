function validateInstance(instance, facetValue) {
    var ins = instance;
    var fv = facetValue.value();
    if (ins != fv) {
        return ins + " should be equal to " + fv;
    }
}
this.register(validateInstance);
//# sourceMappingURL=facetValidator.js.map