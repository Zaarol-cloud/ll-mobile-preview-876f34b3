import {assignments,contracts as c} from "./personal-chest-browser-bundle.mjs";
self.onmessage=event=>{
  let jobId;
  try{
    const message=c.exact(event.data,["jobId","context"]);jobId=message.jobId;c.id(jobId);
    const context=c.exact(message.context,["assignmentInput","generationContextHash"]);
    const input=c.exact(context.assignmentInput,["uid","chestId","solutionCode","assignmentSalt",
      "generatorVersion","codeLength","profileId","packageCount"]);
    if(c.digest(input)!==context.generationContextHash)c.fail("WORKER_CONTEXT_MISMATCH");
    const assignment=assignments.createRankedAssignment(input);
    self.postMessage({jobId,status:"SUCCESS",result:{status:"COMPLETE",
      generationContextHash:context.generationContextHash,assignment}});
  }catch{self.postMessage({jobId,status:"ERROR",code:"GENERATOR_FAILED"});}
};

