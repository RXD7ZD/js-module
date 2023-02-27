Module
.define("ModuleA",[],function () {
    console.log("ModuleA factoryMethod");

    let say = function(){
        console.log("A say halo");
    }
    
    return {
        name:"A Entity",
        say:say
    }
});