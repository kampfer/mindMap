var animationName;
var transformName;
var perspectiveName;
var animationStartName;
var animationIterationName;
var animationEndName;

var BringToViewAnimations = ["rotateInLeft", "fadeIn", "whirlIn", "fallFromTop", "slideInSkew", "tumbleIn", "expandIn"];
var RemoveFromViewAnimations = ["rotateOutRight", "fadeOut", "whirlOut", "slideOutSkew", "tumbleOut"];

// Helper for adding an event listener to an element
function addListener(obj, eventName, listener, capture) {
    if (obj.addEventListener) {
        obj.addEventListener(eventName, listener, capture);
    } else {
        obj.attachEvent("on" + eventName, listener, capture);
    }
}

// Simple function used to detect support for properties from a list of strings
var FirstSupportedPropertyName = function(prefixedPropertyNames) {
    var tempDiv = document.createElement("div");
    for (var i = 0; i < prefixedPropertyNames.length; ++i) {
        if (typeof tempDiv.style[prefixedPropertyNames[i]] != 'undefined')
            return prefixedPropertyNames[i];
    }

    return null;
};

var VerifyTransformAnimationSupport = function() {
    if ((animationName != null) && (transformName != null)) {
        return true;
    }
    return false;
};

// Since CSS Animations and Transforms are not always supported in their unprefixed form, we have to perform some feature detection
var DetectPrefixes = function() {

    // First we figure out the attribute names for usage with bracket style attribute access notation
    transformName = FirstSupportedPropertyName(["transform", "msTransform", "MozTransform", "WebkitTransform", "OTransform"]);
    animationName = FirstSupportedPropertyName(["animation", "msAnimation", "MozAnimation", "WebkitAnimation", "OAnimation"]);
    perspectiveName = FirstSupportedPropertyName(["perspective", "msPerspective", "MozPerspective", "WebkitPerspective", "OPerspective"]);
    // The event names are a bit more tricky to handle due to capitalization
    animationEndName = (animationName + "End").replace(/^ms/, "MS").replace(/^Webkit/, "webkit").replace(/^Moz.*/, "animationend").replace(/^animationEnd$/, "animationend");
    animationStartName = (animationName + "Start").replace(/^ms/, "MS").replace(/^Webkit/, "webkit").replace(/^Moz.*/, "animationstart").replace(/^animationStart$/, "animationstart");
    animationIterationName = (animationName + "Iteration").replace(/^ms/, "MS").replace(/^Webkit/, "webkit").replace(/^Moz.*/, "animationiteration").replace(/^animationIteration/, "animationiteration");

    // We also have some declarative markup that we need to patch up (@keyframes rules and various CSS used in our Test Drive Demo)
    var prefix = "";
    // First we detect the proper prefix
    if (animationName == "msAnimation") {
        prefix = "-ms-";
    } else if (animationName == "MozAnimation") {
        prefix = "-moz-";
    } else if (animationName == "WebkitAnimation") {
        prefix = "-webkit-";
    } else if (animationName == "OAnimation") {
        prefix = "-o-";
    }
};

var ApplyAnimationToElement = function(element, animName) {
    if (element.style[animationName + "Name"] == animName) {
        // If we are reapplying an animation, we need to zero out the value and then reset the property after the function returns.
        element.style[animationName + "Name"] = "";
        setTimeout(function() { element.style[animationName + "Name"] = animName; });
    } else {
        element.style[animationName + "Name"] = animName;
    }
};

var SetupAnimationParameters = function(element) {
    element.style[animationName + "Delay"] = "0.0s";
    element.style[animationName + "Duration"] = "1s";
    element.style[animationName + "IterationCount"] = "1";
    // Setting animation-fill-mode to "forwards" will preserve the to{} keyframe values after the animation
    // is complete. As a result, we do not have to inject a transform on the body element to maintain the post-animation position
    element.style[animationName + "FillMode"] = "forwards";
    element.style[animationName + "TimingFunction"] = "linear";
    element.style[animationName + "PlayState"] = "running";
};

var SetupBodyBringToViewAnimation = function(animName) {
    if (!VerifyTransformAnimationSupport()) return;
    //document.body.style.visibility = "visible";
    if (!animName) {
        animName = GetRandomAnimation(BringToViewAnimations);
    }
    //SetupProjectionOrigin();
    SetupAnimationParameters(document.body);
    ApplyAnimationToElement(document.body, animName);
};

DetectPrefixes();

addListener(document.body, 'animationend', function() {
    alert('animationend');
}, false);