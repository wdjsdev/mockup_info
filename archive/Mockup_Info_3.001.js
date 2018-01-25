/*

Script Name: Mockup_Info
Author: William Dowling
Build Date: 12 January, 2016
Description: Create a dialog for the user to input correct contents of mockup info textframes
Build number: 3.0

Progress:

	Version 3.001
		12 January, 2016
		Initial Rebuild

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
	
		for(var a=0;a<layers.length;a++)
		{
			var thisLay = layers[a];
			if(pat1.test(thisLay.name) && pat2.test(thisLay.layers[0].name))
			{
				//this layer is a template layer. Proceed with creating dialog to input mockup info.
				//loop the sublayers and find the information layer.
				//pass that layer to the createDialog function
				for(var b=0;b<thisLay.layers.length;b++)
				{
					var thisSubLay = thisLay.layers[b];
					if(thisSubLay.name.indexOf("nformat") > -1)
					{
						createDialog(thisSubLay);
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
	function createDialog(info)
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
				if(thisFrame.name == "Garment Code" || thisFrame.name == "Garment Description" || thisFrame.name == "Fabric Type")
				{
					continue;
				}

				var newGroup = w.add("group");

					var frameTxt = newGroup.add("statictext",undefined, thisFrame.name);
					framesAdded[txt] = newGroup.add("edittext", undefined, thisFrame.contents);
					framesAdded[txt].characters = 20;
					frameNames[txt] = thisFrame.name;
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