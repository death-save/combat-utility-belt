console.log("lol javascript module, you can put classes and what not too..");

Hooks.on("ready",  function() {
	console.log("this is shown after the ready hook is invoked, when all elements are currently loaded (canvas/sidebars etc...)"); 
}); 


/**
 * you can technically do whatever after,
 * see onHooks examples from other modules, currently
 * the docs are super basic. This example class
 * declartion is optional even.
 */
class MyApplication extends Application {

}
