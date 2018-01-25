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
			if((pat1.test(thisLay.name) || pat3.test(thisLay.name)) && pat2.test(thisLay.layers[0].name))
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

			var framesAdded = [];
			var frameNames = [];
			//loop the textFrames and create a group for each
			for(var txt  = info.textFrames.length-1;txt  >-1; txt --)
			{
				var thisFrame = info.textFrames[txt];
				if(!opts && (thisFrame.name == "Garment Code" || thisFrame.name == "Garment Description" || thisFrame.name == "Fabric Type"))
				{
					continue;
				}
				else if(opts && thisFrame.name == "Fabric Type")
				{
					continue;
				}

				var newGroup = w.add("group");

					if(thisFrame.name.indexOf("rder") > -1)
					{
						//thisFrame is the order number and team name
						var onContents = thisFrame.contents.substring(0,thisFrame.contents.indexOf(" "));
						var onFrameTxt = newGroup.add("statictext", undefined, "Order Number");
						framesAdded["Order Number"] = newGroup.add("edittext", undefined, onContents);
						framesAdded["Order Number"].characters = 20;
						framesAdded["Order Number"].alignment = "right";
						frameNames["Order Number"] = "Order Number";

						var newNewGroup = w.add("group");
						var tnContents = thisFrame.contents.substring(thisFrame.contents.indexOf(" ") +1, thisFrame.contents.length)
						var tnFrameTxt = newNewGroup.add("statictext", undefined, "Team Name");
						framesAdded["Team Name"] = newNewGroup.add("edittext", undefined, tnContents);
						framesAdded["Team Name"].characters = 20;
						frameNames["Team Name"] = "Team Name";
					}
					else if(thisFrame.name == "Mockup Initials")
					{
						var miContents = thisFrame.contents.substring(0, thisFrame.contents.indexOf(" "));
						var frameTxt = newGroup.add("statictext", undefined, thisFrame.name);
						framesAdded[thisFrame.name] = newGroup.add("edittext", undefined, miContents);
						framesAdded[thisFrame.name].characters = 20;
						frameNames[thisFrame.name] = thisFrame.name;
					}
					else
					{
						var frameTxt = newGroup.add("statictext",undefined, thisFrame.name);
						framesAdded[thisFrame.name] = newGroup.add("edittext", undefined, thisFrame.contents);
						framesAdded[thisFrame.name].characters = 20;
						frameNames[thisFrame.name] = thisFrame.name;
					}
			}

			//add submit and cancel buttons

			var btnGroup = w.add("group");
				var submit = btnGroup.add("button", undefined, "Submit");
				submit.onClick = function()
				{
					for (var fa in framesAdded)
					{
						var thisFrame = framesAdded[fa];
						var frameName = frameNames[fa];

						//if this frame is the mockup initials frame, get the date and append it to the contents
						if(frameName == "Mockup Initials")
						{
							var date = getDate();
							info.textFrames[frameName].contents = thisFrame.text + " " + date;
						}
						else if(frameName == "Order Number")
						{
							info.textFrames["Order Number"].contents = thisFrame.text + " " + framesAdded["Team Name"].text
						}
						else if(frameName == "Team Name")
						{
							continue;
						}
						else
						{
							info.textFrames[frameName].contents = thisFrame.text;
						}
					}
					w.close();
				}
				var cancel = btnGroup.add("button", undefined, "Cancel");
				cancel.onClick = function()
				{
					w.close();
				}

				if(!opts)
				{
					//button to open up the ability to change generally static text frames such as garment description and garment code
					var moreOptions = btnGroup.add("button", undefined, "More Options");
					moreOptions.onClick = function()
					{
						w.close();
						createDialog(info,true);
					}
				}
				else
				{
					//button to close the ability to change generally static text frames
					var lessOptions = btnGroup.add("button", undefined, "Less Options");
					lessOptions.onClick = function()
					{
						w.close();
						createDialog(info,false);
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