public with sharing class TestCreatorController {

    @AuraEnabled(cacheable=true)
    public static Map<String,String> getTypeTestValues(){
        Map<String,String> mapTypeValues = new Map<String,String>();
        Schema.DescribeFieldResult fieldResult = Test__c.Tipo__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        for( Schema.PicklistEntry pickListVal : ple){
            mapTypeValues.put(pickListVal.getLabel(),pickListVal.getValue());
        }
        return mapTypeValues;
    }

    @AuraEnabled
    public static String createTestData( Test__c test , List<Opcion__c> lstOpciones, List<Pregunta__c> lstPreguntas ){
        String message='OK';
        Map<String,String> mapResponseTest;
        Map<String,String> mapResponseOpciones;
        Map<String,String> mapResponsePreguntas;

        mapResponseTest = insertTest(test);

        if( mapResponseTest.get('id') == null || mapResponseTest.get('id') =='' ){
            system.debug('mapResponseTest.get(message):'+mapResponseTest.get('message'));
            return mapResponseTest.get('message');
        }

        Id testId = mapResponseTest.get('id');
        String autoNumber = mapResponseTest.get('autoNumber');
        
        mapResponseOpciones = insertOpciones(lstOpciones,testId);
        
        if( Boolean.valueOf( mapResponseOpciones.get('tieneError') ) ){
            message = mapResponseOpciones.get('message')+'\n';
            deleteSavedRecords(testId);
            return message;
        }
        
        mapResponsePreguntas = insertPreguntas(lstPreguntas,testId,autoNumber);

        if( Boolean.valueOf( mapResponsePreguntas.get('tieneError') ) ){
            message = mapResponsePreguntas.get('message')+'\n';
            deleteSavedRecords(testId);
            return message;
        }
        
        return message;
    }

    public static void deleteSavedRecords(Id testId){
        Test__c testToDelete = new Test__c();
        testToDelete.Id = testId;
        delete testToDelete;
    }

    public static Map<String,String> insertTest(Test__c test){
        Map<String,String> mapResponse = new Map<String,String>{'id' => '', 'message' => '','autoNumber'=>''};
        try {
            insert test;
            system.debug('test.Id:'+test.Id);
            mapResponse.put('id',test.Id);
            mapResponse.put('autoNumber',test.Test_Number__c);
            mapResponse.put('message','OK');
        }
        catch (Exception ex) {
            String message = ' Error : '+ ex.getMessage() +' - Linea : '+ ex.getLineNumber();
            mapResponse.put('message',message);
        }
        return mapResponse;
    }

    public static Map<String,String> insertOpciones(List<Opcion__c> lstOpciones, Id testId){
        Map<String,String> mapResponse = new Map<String,String>{'tieneError'=>'false','message' => ''};
        for(Integer i=0 ; i<lstOpciones.size() ; i++){
            lstOpciones.get(i).Test__c = testId;
        }
        try {
            insert lstOpciones;
            mapResponse.put('message','OK');
        }
        catch (Exception ex) {
            String message = ' Error : ' + ex.getMessage() +' - Linea : '+ ex.getLineNumber();
            mapResponse.put('message',message);
            mapResponse.put('tieneError','true');
        }
        return mapResponse;
    }

    public static Map<String,String> insertPreguntas(List<Pregunta__c> lstPreguntas, Id testId, String autoNumber){
        Map<String,String> mapResponse = new Map<String,String>{'tieneError'=>'false','message' => ''};
        for(Integer i=0 ; i<lstPreguntas.size() ; i++){
            lstPreguntas.get(i).Test__c = testId;
            lstPreguntas.get(i).Name = 'Pregunta '+(i+1)+' - '+autoNumber;
        }
        try {
            insert lstPreguntas;
            mapResponse.put('message','OK');
        }
        catch (Exception ex) {
            String message = ' Error : ' + ex.getMessage() +' - Linea : '+ ex.getLineNumber();
            mapResponse.put('message',message);
            mapResponse.put('tieneError','true');
        }
        return mapResponse;
    }

}