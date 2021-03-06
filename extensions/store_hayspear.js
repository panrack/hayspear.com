/* **************************************************************

   Copyright 2013 Zoovy, Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

************************************************************** */



//    !!! ->   TODO: replace 'username' in the line below with the merchants username.     <- !!!

var store_hayspear = function() {
	var theseTemplates = new Array('');
	var r = {


////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\



	callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
		init : {
			onSuccess : function()	{
				var r = false; //return false if extension won't load for some reason (account config, dependencies, etc).
				
				app.rq.push(['templateFunction','categoryTemplate','onCompletes',function(P) {
					//run slideshow code
					var $context = $(app.u.jqSelector('#',P.parentID));
					
					$('.catPageSlideshow', $context).cycle();
					}]);
				
				app.rq.push(['templateFunction','categoryTemplateCatalog','onCompletes',function(P) {
					var $context = $(app.u.jqSelector('#',P.parentID));
					
					var $printLinkList = $('.printLinkList',$context);
					var paths = app.data.appCategoryList['@paths'];
					
					if(!$('.printLinkList').hasClass('listGenerated')){
						for (var i=0; i<paths.length;i++){
							if (paths[i]!= ".hayspear.zb_printable_hay_bale_spear_attachment_catalogue" && paths[i]!=".hayspear.z_informational_links" && paths[i].indexOf(".hayspear.")==0){
								var $link = $('<li></li>');
								$printLinkList.append($link);
								var tagObj = {
									"callback" : function(rd){
										var data = app.data[rd.datapointer];
										if(data.pretty.indexOf('!')!=0){
											var $a = $('<a href="#">'+data.pretty+'</a>');
											$a.on('click', function(){
												return showContent('category',{'navcat':data.path,'templateID':'categoryTemplatePrintable'})
											});
											$link.append($a);
											}
										else{
											$link.remove();
										}
										}
									};
								app.ext.store_navcats.calls.appNavcatDetail.init(paths[i],tagObj,"mutable");
								}
							}
							$('.printLinkList').addClass('listGenerated');
						}	
						app.model.dispatchThis("mutable");
					}]);
				
				app.ext.store_hayspear.u.initVariations();
				//if there is any functionality required for this extension to load, put it here. such as a check for async google, the FB object, etc. return false if dependencies are not present. don't check for other extensions.
				r = true;

				return r;
				},
			onError : function()	{
//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
//you may or may not need it.
				app.u.dump('BEGIN admin_orders.callbacks.init.onError');
				}
			}
		}, //callbacks



////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//actions are functions triggered by a user interaction, such as a click/tap.
//these are going the way of the do do, in favor of app events. new extensions should have few (if any) actions.
		a : {

			}, //Actions

////////////////////////////////////   RENDERFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//renderFormats are what is used to actually output data.
//on a data-bind, format: is equal to a renderformat. extension: tells the rendering engine where to look for the renderFormat.
//that way, two render formats named the same (but in different extensions) don't overwrite each other.
		renderFormats : {
			
			catPageSlideshow : function($tag, data) {
				var imageList = data.value.split("images=")[1].split("\n")[0].split(",");
				app.u.dump(imageList);
				
				for (var i=0;i<imageList.length;i++){
					$tag.append(app.u.makeImage({"name":imageList[i],"w":"400","h":"200","b":"TTTTTT","class":"catPageSlideshow", "tag":true}));
					}
				
			},
			
			catPageProdList : function($tag,data){
				if(data.value.indexOf("SRC=LIST%3A%24") >= 0){	
					var path = data.value.split("SRC=LIST%3A%24")[1].split("&")[0];
					path = "$"+path;
					
					var tagObj = {
						"callback": function(rd){
							$tag.anycontent({'templateID':data.bindData.templateID,'datapointer':rd.datapointer});
						}
					} 
					
					app.ext.store_navcats.calls.appNavcatDetail.init(path,tagObj,"mutable");
					app.model.dispatchThis("mutable");
					}
				else {
					//There is no src list
				}
			},
			
			hideIfProdList : function($tag,data){
				if(data.value.indexOf("SRC=LIST%3A%24") >= 0){
					$tag.hide();
				}
			}

			}, //renderFormats
////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//utilities are typically functions that are exected by an event or action.
//any functions that are recycled should be here.
		u : {
			initVariations : function(){
				if(handlePogs){
					$.extend(handlePogs.prototype,app.ext.store_hayspear.variations);
					} 
				else {
				   setTimeout(function(){app.ext.myExt.u.initVariations();}, 250);
					}
				}
			}, //u [utilities]

//app-events are added to an element through data-app-event="extensionName|functionName"
//right now, these are not fully supported, but they will be going forward. 
//they're used heavily in the admin.html file.
//while no naming convention is stricly forced, 
//when adding an event, be sure to do off('click.appEventName') and then on('click.appEventName') to ensure the same event is not double-added if app events were to get run again over the same template.
		e : {
			}, //e [app Events]
		
		
		variations : {
			renderOptionRADIOwithPrice: function(pog)	{
				app.u.dump(pog);
				var pogid = pog.id;

				var $parentDiv = $("<span \/>").addClass('labelsAsBreaks');
				
			//display ? with hint in hidden div IF ghint is set
				if(pog['ghint']) {$parentDiv.append(pogs.showHintIcon(pogid,pog['ghint']))}
				var i = 0;
				var len = pog['@options'].length;
				while (i < len) {
					$parentDiv.append($("<label \/>").append($('<input>').attr({type: "radio", name: pogid, value: pog['@options'][i]['v']})).append(pog['@options'][i]['prompt']).append(" "+app.u.formatMoney(pog['@options'][i].p, '$',2)));
					i++;
					}
				return $parentDiv;
				},
			
			xinit : function(){
				this.addHandler("type","radio","renderOptionRADIOwithPrice");
				}
			}
		} //r object.
	return r;
	}