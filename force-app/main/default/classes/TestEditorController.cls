public with sharing class TestEditorController {

    @AuraEnabled(cacheable=true)
    public static List<Test__c> getTestRelated( String testId ){
        if(testId == 'undefined'){
            return new List<Test__c>();
        }
        return [SELECT Id,Name,Descripcion__c,Intrucciones__c,Tipo__c,Autor__c FROM Test__c WHERE Id = :testId ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Opcion__c> getOptionstRelated( String testId ){
        if(testId == 'undefined' ){
            return new List<Opcion__c>();
        }
        return [SELECT Id,Test__c,Name,Orden__c,Preguntas_Relacionadas__c,Valor__c,Orden_por_pregunta__c,Tiene_Multiples_Valores__c FROM Opcion__c WHERE Test__c = :testId ORDER BY Orden__c ASC ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Pregunta__c> getQuestionsRelated( String testId ){
        if(testId == 'undefined' ){
            return new List<Pregunta__c>();
        }
        return [SELECT Id,Test__c,Orden__c,Descripcion__c,Valor__c,Usa_valores_inversos__c FROM Pregunta__c WHERE Test__c = :testId ORDER BY Orden__c ASC ];
    }

    @AuraEnabled
    public static String updateTestData( Test__c test , List<Opcion__c> lstOpciones, List<Pregunta__c> lstPreguntas ){
        system.debug('INGRESO AL METODO updateTestData');
        String message='OK';
        Map<String,String> mapResponseTest;
        Map<String,String> mapResponseOpciones;
        Map<String,String> mapResponsePreguntas;

        mapResponseTest = updateTest(test);

        if( mapResponseTest.get('id') == null || mapResponseTest.get('id') =='' ){
            system.debug('mapResponseTest.get(message):'+mapResponseTest.get('message'));
            return mapResponseTest.get('message');
        }

        Id testId = mapResponseTest.get('id');
        String autoNumber = TestUtils.getTestNumberByTestId(testId);
        
        mapResponseOpciones = updateOpciones(lstOpciones,testId);
        
        if( Boolean.valueOf( mapResponseOpciones.get('tieneError') ) ){
            message = mapResponseOpciones.get('message')+'\n';
            return message;
        }
        
        mapResponsePreguntas = updatePreguntas(lstPreguntas,testId,autoNumber);

        if( Boolean.valueOf( mapResponsePreguntas.get('tieneError') ) ){
            message = mapResponsePreguntas.get('message')+'\n';
            return message;
        }
        
        return message;
    }

    public static Map<String,String> updateTest(Test__c test){
        Map<String,String> mapResponse = new Map<String,String>{'id' => '', 'message' => ''};
        try {
            update test;
            system.debug('test.Id:'+test.Id);
            mapResponse.put('id',test.Id);
            mapResponse.put('message','OK');
        }
        catch (Exception ex) {
            String message = ' Error : '+ ex.getMessage() +' - Linea : '+ ex.getLineNumber();
            mapResponse.put('message',message);
        }
        return mapResponse;
    }

    public static Map<String,String> updateOpciones(List<Opcion__c> lstOpciones, Id testId){
        Map<String,String> mapResponse = new Map<String,String>{'tieneError'=>'false','message' => ''};
        for(Integer i=0 ; i<lstOpciones.size() ; i++){
            if( lstOpciones.get(i).Test__c == null ){
                lstOpciones.get(i).Test__c = testId;
            }
        }
        try {
            upsert lstOpciones;
            mapResponse.put('message','OK');
        }
        catch (Exception ex) {
            String message = ' Error : ' + ex.getMessage() +' - Linea : '+ ex.getLineNumber();
            mapResponse.put('message',message);
            mapResponse.put('tieneError','true');
        }
        return mapResponse;
    }

    public static Map<String,String> updatePreguntas(List<Pregunta__c> lstPreguntas, Id testId,String autoNumber){
        Map<String,String> mapResponse = new Map<String,String>{'tieneError'=>'false','message' => ''};
        for(Integer i=0 ; i<lstPreguntas.size() ; i++){
            if( lstPreguntas.get(i).Test__c == null ){
                lstPreguntas.get(i).Test__c = testId;
                lstPreguntas.get(i).Name = 'Pregunta '+(i+1)+' - '+autoNumber;
            }
        }
        try {
            upsert lstPreguntas;
            mapResponse.put('message','OK');
        }
        catch (Exception ex) {
            String message = ' Error : ' + ex.getMessage() +' - Linea : '+ ex.getLineNumber();
            mapResponse.put('message',message);
            mapResponse.put('tieneError','true');
        }
        return mapResponse;
    }

    @AuraEnabled
    public static Map<Boolean,String> deleteQuestion(String idQuestion){
        if(idQuestion == '' || idQuestion==null ){
            return new Map<Boolean,String>{false=>'La pregunta no se puede eliminar'};
        }

        Map<Boolean,String> message = new Map<Boolean,String>();
        
        try {
            Pregunta__c pregunta = new Pregunta__c();
            pregunta.Id = idQuestion;
            delete pregunta;
            message.put(true,'La pregunta fue eliminada correctamente');
        }
        catch (Exception ex) {
            message.put(false,ex.getMessage() );
        }
        
        return message;
    }

    @AuraEnabled
    public static Map<Boolean,String> deleteOption(String idOption){
        if(idOption == '' || idOption==null ){
            return new Map<Boolean,String>{false=>'La opción no se puede eliminar'};
        }

        Map<Boolean,String> message = new Map<Boolean,String>();
        
        try {
            Opcion__c opcion = new Opcion__c();
            opcion.Id = idOption;
            delete opcion;
            message.put(true,'La opción fue eliminada correctamente');
        }
        catch (Exception ex) {
            message.put(false,ex.getMessage() );
        }
        
        return message;
    }

}