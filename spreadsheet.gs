function generateGraphs(){
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var result = SpreadsheetApp.setActiveSheet(sheet.getSheets()[2]);
  var graphs = SpreadsheetApp.setActiveSheet(sheet.getSheets()[3]);
  var count_result = result.getLastRow();
  var contribs, contrib;
  
  var b=0, c=0, t=0, a=0, s=0, n=0;// group counters
  
  var cB=0, cC=0, cT=0, cA=0, cS=0, cN=0;//convergence counter
  
  var total;
  
  contribs = result.getRange(2, 1, count_result, 9).sort([{ column: 8, ascending: true }]).getValues();
  
  for(var i=0; i < count_result; i++){
    contrib = contribs[i];
    
    switch(contrib[7]){
      case 'baby':
        b++;
        cB += contrib[8];
      break;
        
      case 'child':
        c++;
        cC += contrib[8];
      break;
        
      case 'teenager':
        t++;
        cT += contrib[8];
      break;
      
      case 'adult':
        a++;
        cA += contrib[8];
      break;
      
      case 'senior':
        s++;
        cS += contrib[8];
      break;
      
      case 'not_person':
        n++;
        cN += contrib[8];
    }
    
    graphs.getRange(2,2).setValue(cB/b);
    graphs.getRange(3,2).setValue(cC/c);
    graphs.getRange(4,2).setValue(cT/t);
    graphs.getRange(5,2).setValue(cA/a);
    graphs.getRange(6,2).setValue(cS/s);
    graphs.getRange(7,2).setValue(cN/n);
    
    total = b+c+t+a+s+n;   
    
    graphs.getRange(2,3).setValue(b/total);
    graphs.getRange(3,3).setValue(c/total);
    graphs.getRange(4,3).setValue(t/total);
    graphs.getRange(5,3).setValue(a/total);
    graphs.getRange(6,3).setValue(s/total);
    graphs.getRange(7,3).setValue(n/total);
  }
  

  
}

function computeResult(blocks,pos){
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var result = SpreadsheetApp.setActiveSheet(sheet.getSheets()[2]);
  var urls = [];
  var url;
  var groups = [];
  var grp;
  var n_images = 0;
  var idx;
  var line;
  var row = 1;
  var b,c,t,a,s,n;//group counters
  var mode;
  var convergence;
  var total, bigger;
  
  for(var i=0; i < pos; i++){
    for(j=0; j < 5; j++){
      url = blocks[i][j].image_url;
      grp = blocks[i][j].image_classification
      idx = urls.indexOf(url);
      
      if(idx < 0){
        urls[n_images] = url;
        groups[n_images] = [];
        groups[n_images]['baby'] = 0;
        groups[n_images]['child'] = 0;
        groups[n_images]['teenager'] = 0;
        groups[n_images]['adult'] = 0;
        groups[n_images]['senior'] = 0; 
        groups[n_images]['not_person'] = 0; 
        idx = n_images;
        n_images++; 
      }
      
      groups[idx][grp]++;
    }
    
  }
     
  for(i=1; i < n_images; i++){
    b = groups[i]['baby'];
    c = groups[i]['child'];
    t = groups[i]['teenager'];
    a = groups[i]['adult'];
    s = groups[i]['senior'];
    n = groups[i]['not_person'];
        
    result.getRange(i+1,1).setValue(urls[i]);
    result.getRange(i+1,2).setValue(b);
    result.getRange(i+1,3).setValue(c);
    result.getRange(i+1,4).setValue(t);
    result.getRange(i+1,5).setValue(a);
    result.getRange(i+1,6).setValue(s);
    result.getRange(i+1,7).setValue(n);
    
    total = b+c+t+a+s+n;

    mode = 'baby';
    bigger = b;
    if(c > bigger){mode = 'child'; bigger = c;}
    if(t > bigger){mode = 'teenager'; bigger = t;}
    if(a > bigger){mode = 'adult'; bigger = a;}
    if(s > bigger){mode = 'senior'; bigger = s;}
    if(n > bigger){mode = 'not_person'; bigger = n;}
    
    result.getRange(i+1,8).setValue(mode);
    result.getRange(i+1,9).setValue(bigger/total);
    
    
  }
  
}

function checkGolden(contribution) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var golden = SpreadsheetApp.setActiveSheet(sheet.getSheets()[1]);
  var count_golden = golden.getLastRow();
  var image_url;
  var image_classification;
  
  for(var i=0; i < 5; i++){
    image_url = contribution[i].image_url;
    image_classification = contribution[i].image_classification;
    
    for(var j=1; j < count_golden; j++){
      line = golden.getRange(j+1, 1, j+1, 2).getValues();
      if(image_url == line[0][0]){
        if(image_classification == line[0][1]){
          return true;
        }
      }
    }
    
  }
  
  return false;
}


function Main() {
  var contributions = [];
  var contribution = {};
  var blocks = [];
  var line;
  
  var pos;
  var lines;
  var values;
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var data = SpreadsheetApp.setActiveSheet(sheet.getSheets()[0]);
    
  var count_data = data.getLastRow();
  
  lines = data.getRange(2, 1, count_data, 6).sort([{ column: 6, ascending: true }]);
  
  values = lines.getValues();
  
  pos = 0;
  
  for(var i=0; i< count_data/5 -1; i++){  
    contribution = [];
    
    for(var j=0; j < 5; j++){
      line = values[i*5+j];    
      contribution[j] = {timestamp:line[0],time:line[1],image_url:line[2],image_classification:line[3],user_id:line[4],contr_id:line[5]};
    }
    
    if( checkGolden(contribution) ){
      blocks[pos] = contribution;    
      pos++;
    }
        
  }
  
  computeResult(blocks,pos)
  generateGraphs();
}



