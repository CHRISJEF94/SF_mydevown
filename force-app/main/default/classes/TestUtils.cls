public with sharing class TestUtils {
    public static String getTestNumberByTestId(Id testId){
        List<Test__c> lstTest = new List<Test__c>([SELECT Test_Number__c FROM Test__c WHERE Id = :testId]);
        if(lstTest.size()>0){
            return String.valueOf(lstTest.get(0).Test_Number__c);
        }
        return null;
    }
}