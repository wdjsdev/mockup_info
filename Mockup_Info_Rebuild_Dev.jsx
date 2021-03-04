#target Illustrator
function mockupInfo()
{
	var valid = true;
	var scriptName = "mockup_info";

	function getUtilities()
	{
		var result = [];
		var utilPath = "/Volumes/Customization/Library/Scripts/Script_Resources/Data/";
		var ext = ".jsxbin"

		//check for dev utilities preference file
		var devUtilitiesPreferenceFile = File("~/Documents/script_preferences/dev_utilities.txt");

		if(devUtilitiesPreferenceFile.exists)
		{
			devUtilitiesPreferenceFile.open("r");
			var prefContents = devUtilitiesPreferenceFile.read();
			devUtilitiesPreferenceFile.close();
			if(prefContents === "true")
			{
				utilPath = "~/Desktop/automation/utilities/";
				ext = ".js";
			}
		}

		if($.os.match("Windows"))
		{
			utilPath = utilPath.replace("/Volumes/","//AD4/");
		}

		result.push(utilPath + "Utilities_Container" + ext);
		result.push(utilPath + "Batch_Framework" + ext);

		if(!result.length)
		{
			valid = false;
			alert("Failed to find the utilities.");
		}
		return result;

	}

	var utilities = getUtilities();
	for(var u=0,len=utilities.length;u<len;u++)
	{
		eval("#include \"" + utilities[u] + "\"");	
	}

	if(!valid)return;

	if(user === "will.dowling")
	{
		DEV_LOGGING = true;
	}

	logDest.push(getLogDest());




	//logic


	function findGarmentLayers()
	{
		log.h("Beginning execution of findGarmentLayers() function.");
		var result = [];

		var curLay;
		for(var x=0,len=layers.length;x<len;x++)
		{
			curLay = layers[x];
			if(isTemplate(curLay))
			{
				log.l("pushing " + curLay + " to result array.");
				result.push(curLay);
			}
		}

		if(!result.length)
		{
			errorList.push("There were no converted templates found in this master file. Cannot proceed.");
			log.e("No Converted templates found. Exiting script.");
			valid = false;
		}

		log.l("end of findGarmentLayers() function. returning::" + result);
		return result;
	}

	function setActiveArtboard(infoLayer)
	{
		for(var x=0;x<infoLayer.pageItems.length;x++)
		{
			curItem = infoLayer.pageItems[x];
			curPos = curItem.pos;
			for(var y=0;y<aB.length;y++)
			{
				if(intersects(curItem,aB[y]))
				{
					result = aB.setActiveArtboardIndex(y);
				}
			}
		}
		app.executeMenuCommand("fitin");
	}

	function loopGarmentLayers()
	{
		var curGarmentLayer;
		var curInfoLayer;
		var newFrameInfo;
		for(var x=0;x<garmentLayers.length;x++)
		{
			curGarmentLayer = garmentLayers[x];
			curInfoLayer = findSpecificLayer(curGarmentLayer.layers,"Info","any");
			setActiveArtboard(curInfoLayer);
			if(curInfoLayer)
			{
				newFrameInfo = createDialog(garmentLayers[x].name,getFrameInfo(curInfoLayer));
			}
			else
			{
				errorList.push(curGarmentLayer.name + " has no Information Layer.");
			}

			if(newFrameInfo)
			{
				updateFrames(curInfoLayer,newFrameInfo);
			}
		}
	}

	function updateFrames(infoLay,frameInfo)
	{
		var curFrame;
		for(var x=0;x<infoLay.textFrames.length;x++)
		{
			curFrame = infoLay.textFrames[x];
			if(frameInfo[curFrame.name])
			{
				curFrame.contents = frameInfo[curFrame.name];
			}
		}
	}

	function getFrameInfo(infoLay)
	{
		/*
		frameInfo format is like so:
			frameInfo = 
				{
					"textFrame.name":"textFrame.contents",
					"Order Number" : "1234567_Team Name_IN",
					"Name":"xxxx"
				}
		*/
		var frameInfo = {};

		var curFrame,curName,curContents;
		for(var x=0;x<infoLay.textFrames.length;x++)
		{
			curFrame = infoLay.textFrames[x];
			curName = curFrame.name;
			if(!frameInfo[curName])
			{
				frameInfo[curName] = curFrame.contents;
			}
		}
		return frameInfo;
	}

	function createDialog(garmentName,frameInfo)
	{
		
		var inputGroups = [];
		var w = new Window("dialog");
		var msg = UI.static(w,"Input the appropriate data for " + garmentName);

		var counter = 0;
		var curGroup;
		var len = 25;
		for(var frameName in frameInfo)
		{
			inputGroups[counter] = curGroup = UI.group(w);
			inputGroups[counter].orientation = "row";
			inputGroups[counter].msg = UI.static(curGroup,frameName,len);
			inputGroups[counter].input = UI.edit(curGroup,frameInfo[frameName],len);
			counter++;
		}

		var btnGroup = UI.group(w);
		var cancel = UI.button(btnGroup,"Cancel",function()
		{
			valid = false;
			w.close();
		})
		var submit = UI.button(btnGroup,"Submit",function()
		{
			for(var x=0;x<inputGroups.length;x++)
			{
				frameInfo[inputGroups[x].msg.text] = inputGroups[x].input.text;
			}
			w.close();
		})
		w.show();

		return frameInfo;
		


	}




	//end logic





	//global variables
	var docRef = app.activeDocument;
	var aB = docRef.artboards;
	var layers = docRef.layers;
	var garmentLayers = findGarmentLayers();

	//list of things we typically don't want to change.
	//put these at the bottom of the dialog and disable them
	//by default
	var hiddenFrames = ["Garment Description","Garment Code"];






	//procedure
	loopGarmentLayers();


}
mockupInfo();