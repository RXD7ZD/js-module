let Module = (function(){
	let modules = {};//工程-模块集合(已加载完毕)
	let loadingModules = []//模块加载栈：存放待加载依赖的模块

	let setModule = function(module){
		modules[module.name] = module;
	}
	let getModule = function(name) {
		return modules[name];
	}

	let initModule = function (module) {
		let dependenceEntities = [];
		for (let i = 0; i < module.dependenciesName.length; i++) {
			let dependence = module.dependencies[i];
			if(dependence||dependence==null){
				dependenceEntities[i] = dependence;
			}
		}
		
		module.entity = module.factoryMethod.apply(module,dependenceEntities);
	}

	//创建模块
	let createModule = function(name,dependenciesName,factoryMethod){

		//检查模块依赖
		let dependencies=[];
		for (let i = 0; i < dependenciesName.length; i++) {
			let dependenceName = dependenciesName[i];
			let dependence = modules[dependenceName];
			if(dependence===undefined){
				dependence=null
			}
			

			dependencies.push(dependence);		
		}

		//生产模块数据
		let module = { 
			name: name//模块名
			,state:"loading" //状态
			,dependenciesName: dependenciesName
			,dependencies: dependencies //依赖subnode
			,factoryMethod: factoryMethod //工厂方法
			,entity:null//实体
			,callbackModule:null
		};

		return module;
	}

	//检查待加载的模块集合-每次有新模块loaded时调用
	let checkLoadingModules = function() {
		
		let isLoadedHappened=true;//是否发生loaded
		while (isLoadedHappened) {
			isLoadedHappened=false;
			for (let i = 0; i <loadingModules.length; i++) {
				let module = loadingModules[i];
				
				module.state = checkModuleDependencies(module);
				
				if("loaded" == module.state){
					//#模块-依赖完整

					//移除加载中的集合
					loadingModules.splice(i,1);
					//初始化模块
					initModule(module);
					//set  已 loaded 的 module
					setModule(module);
					//标识-存在至少一次loaded
					isLoadedHappened = true;
					
					//检查父模块是否loaded
					break;
				}else{
					//#模块-缺失依赖

					//待处理在define时间定义，此处不需要处理
					//loadingModules.push(module);
					//i++;//处理下一个loadingModule
				}
			}
			
		}
	}
	
	//检查模块依赖
	let checkModuleDependencies = function(module,isScanf) {
		if((!isScanf) && (module.state=="loaded")){
			return true;
		}

		let thisModuleState = "loaded";

		//检查依赖
		for(let i = 0;i<module.dependenciesName.length;i++){
			if (module.dependencies[i]===null||module.dependencies[i]) {//该模块存在依赖
				//依赖名
				let dependenceName =module.dependenciesName[i];
				//检查是否已加载依赖模块
				let findModule = modules[dependenceName];
				
				

				if(findModule){//modules里有模块
					module.dependencies[i] = findModule.entity;//添加依赖的引用
					console.log(module.name," MODULE LOADED: ",findModule);
				}else{//modules里没有模块
					if (findModule===null) {
						
					}

					thisModuleState = "loading";//只要有一个依赖没找到就标识为loading状态
					//console.log(module.name," WAIT LOADING MODULE: ",dependenceName);
				}
			}
		}

		if(thisModuleState=="loaded"){
			module.state = thisModuleState;
			console.log(" LOADED MODULE:",module.name);
		}
		
		return thisModuleState;
	}

	let use = function(name) { 
		let module = getModule(name);
		
		return module.entity;
	}

	
	let define = function(name,dependenciesName,factoryMethod){
		//模块名已存在-输出相关信息
		if(getModule(name)){
			console.log("exits Module:"+name);
			//return modules[name];
			return this;
		}


		//模块信息生成
		let module = createModule(name,dependenciesName,factoryMethod);

		//新模块-检查依赖
		module.state = checkModuleDependencies(module)
		if("loaded"== module.state){
			//依赖完善-则添加模块集合
			//module.state = "loaded";
			//初始化模块
			initModule(module);
			setModule(module);	
			//检查待加载模块集合-当前module被依赖的情况
			checkLoadingModules();	
		}else{
			//依赖缺失-则添加待加载模块集合
			//module.state = "loading";
			loadingModules.push(module);
		}

		
		
	}

	
	
	let importJS = function(src){
		let script = document.createElement("script");
		script.type = "text/javascript";
		script.src = src;
		document.head.appendChild(script);
		return Module;
	}

	let entry = function(fn){
		document.body.onload = fn;
	};
	

	return {
		modules,
		loadingModules,
		define,
		use,
		importJS,
		entry
	}
})();