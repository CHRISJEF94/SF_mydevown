({
    onInit : function(component, event, helper) {
        var recordId = component.get("v.recordId");
        console.log('recordId:'+recordId);
        if(recordId==undefined){
            recordId = 'NO DATA';
        }
        console.log('recordId:'+recordId);
        component.set("v.recordIdActual", String(recordId));
    }
})