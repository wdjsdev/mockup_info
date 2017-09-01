/*

Script Name: Mockup_Info
Author: William Dowling
Build Date: 12 January, 2017
Description: Create a dialog for the user to input correct contents of mockup info textframes
Build number: 3.0

Progress:

	Version 3.001
		12 January, 2017
		Initial Rebuild

	Version 3.002
		16 January, 2017

	Version 3.003
		30 January, 2017
		Changing dialog to allow for hidden elements to be shown when 'more options' button is clicked. 
			originally a new dialog opened, but the old dialog didn't change.
			so now i'll try to change the dialog dynamically rather than close and open a new one.
		3.003 was a complete failure. reverting to version 3.002 and rewriting the dialog to build an object rather than use arrays

	Version 3.004
		31 January, 2017
		Reworking dialog to create an property in an object each time a group is added to the dialog
		Set moreOptions button to enable the disabled edittext instances for garment code and description.
		Everything working so far. need to test further, but for now everything looks good.

*/

function container()
{

	/*****************************************************************************/

	///////Begin/////////
	///Logic Container///
	/////////////////////

	//sendErrors Function Description
	//Display any errors to the user in a preformatted list
	function sendErrors(errorList)
	{
		var localValid = true;
	
		alert(errorList.join("\n"));
	
	
		return localValid
	}

	function getDate()
	{
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getYear();
		var yy = yyyy-100;

		if(dd<10) {
			dd='0'+dd
		} 
		if(mm<10) {
			mm='0'+mm
		} 
		return mm+'.'+dd+'.'+yy;
	}


	//loopGarments Function Description
	//loop each layer in the document and run createDialog function on the information layer of each
	//scriptable template layer.
	function loopGarments()
	{


		var pat1 = /(FD|PS)[-_][\d|a-zA-Z]{3,6}.?[-_]/i;
		var pat2 = /(artwork)|(mockup)|(prepress)|(info)/i;
		var pat3 = /(FD..)[-_][\d]{3,4}/i;
	
		for(var a=0;a<layers.length;a++)
		{
			var thisLay = layers[a];
			if((pat1.test(thisLay.name) || pat3.test(thisLay.name)) && thisLay.layers.length > 0 && pat2.test(thisLay.layers[0].name))
			{
				//this layer is a template layer. Proceed with creating dialog to input mockup info.
				//loop the sublayers and find the information layer.
				//pass that layer to the createDialog function
				for(var b=0;b<thisLay.layers.length;b++)
				{
					var thisSubLay = thisLay.layers[b];
					if(thisSubLay.name.indexOf("nformat") > -1)
					{
						createDialog(thisSubLay,false);
					}
				}
			}
			else
			{
				//this layer is not a template layer, continue
				continue;
			}
		}
	

	}	



	//firstFunction Function Description
	//create a scriptUI dialog to prompt user for input of all textFrames on the info layer for the current document;
	function createDialog(info,opts)
	{
		//create a new dialog
		var title = "Enter the info for " + info.parent.name;
		var w = new Window("dialog", title);
			w.alignChildren = "left";
			var topTxt = w.add("statictext", undefined, "Enter the appropriate information below:");
			var descTxt = w.add("statictext", undefined, "Change the fields if necessary. Otherwise, leave them as they are.")

			var dialogGroups = {};

			//loop the textFrames and create a group for each
			for(var txt  = info.textFrames.length-1;txt  >-1; txt --)
			{
				var thisFrame = info.textFrames[txt];
				if(thisFrame.name == "Fabric Type")
				{
					continue;
				}

				if(lib[thisFrame.name] == undefined)
				{
					if(thisFrame.name != "Mockup Initials")
					{
						var cont = thisFrame.contents
					}
					else
					{
						var cont = thisFrame.contents.substring(0,thisFrame.contents.indexOf(" "))
					}
				}
				else
				{
					var cont = lib[thisFrame.name];
				}

				if(thisFrame.name.indexOf("rder") > -1)
				{
					//order number
					if(cont.indexOf(" #")>-1)
					{
						var onContents = cont.substring(0,cont.indexOf(" #")+2);
					}
					else
					{
						var onContents = cont.substring(0,cont.indexOf(" "));
					}
					dialogGroups["Order Number"] = {};
					dialogGroups["Order Number"]["group"] = w.add("group");
					var newGroup = dialogGroups["Order Number"]["group"];
					dialogGroups["Order Number"]["static"] = newGroup.add("statictext", undefined, "Order Number");
					dialogGroups["Order Number"]["input"] = newGroup.add("edittext", undefined, onContents)
					dialogGroups["Order Number"]["input"].characters = 20;


					//team name

					if(cont.indexOf(" #")>-1)
					{
						var tnContents = cont.substring(cont.indexOf(" #")+3, cont.length);
					}
					else
					{
						var tnContents = cont.substring(cont.indexOf(" ")+1, cont.length);
					}
					dialogGroups["Team Name"] = {};
					dialogGroups["Team Name"]["group"] = w.add("group");
					var newNewGroup = dialogGroups["Team Name"]["group"];
					dialogGroups["Team Name"]["static"] = newNewGroup.add("statictext", undefined, "Team Name");
					dialogGroups["Team Name"]["input"] = newNewGroup.add("edittext", undefined, tnContents);
					dialogGroups["Team Name"]["input"].characters = 20;
				}

				else if(thisFrame.name == "Mockup Initials")
				{
					//mockup initials
					// var miContents = cont.substring(0, cont.indexOf(" "));
					dialogGroups["Mockup Initials"] = {};
					dialogGroups["Mockup Initials"]["group"] = w.add("group");
					var newGroup = dialogGroups["Mockup Initials"]["group"];
					dialogGroups["Mockup Initials"]["static"] = newGroup.add("statictext", undefined, "Mockup Initials");
					dialogGroups["Mockup Initials"]["input"] = newGroup.add("edittext", undefined, cont);
					dialogGroups["Mockup Initials"]["input"].characters = 20;
				}
				else if(thisFrame.name == "Garment Code" || thisFrame.name == "Garment Description")
				{
					dialogGroups[thisFrame.name] = {};
					dialogGroups[thisFrame.name]["group"] = w.add("group");
					var newGroup = dialogGroups[thisFrame.name]["group"];
					dialogGroups[thisFrame.name]["static"] = newGroup.add("statictext", undefined, thisFrame.name);
					dialogGroups[thisFrame.name]["input"] = newGroup.add("edittext", undefined, cont);
					dialogGroups[thisFrame.name]["input"].characters = 20;
					dialogGroups[thisFrame.name]["input"].enabled = false;
					dialogGroups[thisFrame.name]["mo"] = true;
				}
				else
				{
					//any other textFrames
					dialogGroups[thisFrame.name] = {};
					dialogGroups[thisFrame.name]["group"] = w.add("group");
					var newGroup = dialogGroups[thisFrame.name]["group"];
					dialogGroups[thisFrame.name]["static"] = newGroup.add("statictext", undefined, thisFrame.name);
					dialogGroups[thisFrame.name]["input"] = newGroup.add("edittext", undefined, cont);
					dialogGroups[thisFrame.name]["input"].characters = 20;
				}
			}

			//add submit and cancel buttons

			var btnGroup = w.add("group");
				var submit = btnGroup.add("button", undefined, "Submit");
				submit.onClick = function()
				{
					for (var fa in dialogGroups)
					{
						var inputText = dialogGroups[fa]["input"].text;
						var frameName = dialogGroups[fa]["static"].text;

						//if this frame is the mockup initials frame, get the date and append it to the contents
						if(frameName == "Mockup Initials")
						{
							var date = getDate();
							info.textFrames[frameName].contents = inputText + " " + date;
							if(lib["Mockup Initials"] == undefined)
							{
								lib["Mockup Initials"] = inputText;
							}
						}
						else if(frameName == "Order Number")
						{
							info.textFrames["Order Number"].contents = inputText + " " + dialogGroups["Team Name"]["input"].text;
							if(lib["Order Number"] == undefined)
							{
								lib["Order Number"] = inputText;
							}
						}
						else if(frameName == "Team Name")
						{
							if(lib["Order Number"] != undefined)
							{
								lib["Order Number"] += " " + inputText;
							}
							continue;
						}
						else
						{
							info.textFrames[frameName].contents = inputText;
							if(lib[frameName] == undefined && frameName != "Garment Description" && frameName != "Garment Code")
							{
								lib[frameName] = inputText;
							}
						}
					}
					w.close();
				}
				var cancel = btnGroup.add("button", undefined, "Cancel");
				cancel.onClick = function()
				{
					w.close();
				}


				//button to open up the ability to change generally static text frames such as garment description and garment code
				var moreOptions = btnGroup.add("button", undefined, "More Options");
				moreOptions.onClick = function()
				{
					if(!opts)
					{
						for(var x in dialogGroups)
						{
							if(dialogGroups[x]["mo"] != undefined)
							{
								dialogGroups[x]["input"].enabled = true;
							}
						}
						w.layout.layout(true);
						opts = true;
					}
					else
					{
						for(var x in dialogGroups)
						{
							if(dialogGroups[x]["mo"] != undefined)
							{
								dialogGroups[x]["input"].enabled = false;
							}
						}
						w.layout.layout(true);
						opts = false;
					}
				}
				

		w.show();
	}



	////////End//////////
	///Logic Container///
	/////////////////////

	/*****************************************************************************/

	///////Begin////////
	////Data Storage////
	////////////////////

	var lib = 
	{
		"Order Number" : undefined,
		"Team Name" : undefined,
		"Mockup Initials" : undefined
	}


	////////End/////////
	////Data Storage////
	////////////////////

	/*****************************************************************************/

	///////Begin////////
	///Function Calls///
	////////////////////

	var docRef = app.activeDocument;
	var layers = docRef.layers;
	var aB = docRef.artboards;
	var swatches = docRef.swatches;

	var errorList = [];

	var valid = true;

	valid = loopGarments();




	////////End/////////
	///Function Calls///
	////////////////////

	/*****************************************************************************/

	if(errorList.length>0)
	{
		sendErrors(errorList);
	}
	return valid

}
container();