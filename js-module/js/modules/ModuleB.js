Module
.importJS("js/modules/ModuleA.js")
.define("ModuleB",["ModuleA"],function (ModuleA) {
    console.log("ModuleB factoryMethod")
    
    console.log("ModuleA:",ModuleA);
    let say = function(){
        
    }
    say();
    return {
        name : "B Entity",
        say:say
    }
});

