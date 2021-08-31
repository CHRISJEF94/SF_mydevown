public class cmpLeadCaptureSiteCtrl {

    @AuraEnabled
    public static List<String> registerLeadFromSite( Lead newLead ){
        try {
            List<String> lstDuplicateResults = cmpLeadCaptureSiteCtrl.checkDuplicates(newLead);
            if(lstDuplicateResults.size() == 0){
                insert newLead;
            }
            return  lstDuplicateResults;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public static List<String> checkDuplicates(Lead leadToCheck){
        List<String> lstDuplicateResults = new List<String>();

        List<Lead> lstLeadToCheck = new List<Lead>();
        lstLeadToCheck.add(leadToCheck); 
        
        List<Datacloud.FindDuplicatesResult> duplicateResults = Datacloud.FindDuplicates.findDuplicates(lstLeadToCheck); 
        system.debug(duplicateResults);
        if( duplicateResults.size() == 0 ){
            return lstDuplicateResults;
        }
        
        for ( Integer i = 0; i<duplicateResults.size() ;i++)  {
            for (Datacloud.DuplicateResult dupeResult : duplicateResults[i].getDuplicateResults()) {
                Datacloud.MatchResult[] matchResults = dupeResult.getMatchResults();
                Datacloud.MatchResult matchResult = matchResults[0]; 
                Datacloud.MatchRecord[] matchRecords = matchResult.getMatchRecords();
                for (Datacloud.MatchRecord matchRecord : matchRecords) {
                    system.debug(matchRecord.getRecord());
                    lstDuplicateResults.add( JSON.serialize(matchRecord.getRecord()));
                }
            }
        }
        return lstDuplicateResults;
    }

}
