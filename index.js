
        //Generated Client Code -- do not modify

        /* REQUIREMENTS

        libaries -
            axios

        config
            src/config.GEN-API-URL
        
        */
        import axios from 'axios'
        import {GEN_API_URL} from 'src/config'
        //table - name of table
        // query - where clause (omit 'where')
        // include child data objects (linked on forign keys)
        module.exports.getData = async (table,query,includeChildren) =>{

            let queryObject = {tableName:table,includeDeps:includeChildren};
            if(query)
            {
                queryObject.where = query;
            }
            var result = await axios.post(GEN_API_URL+'/data/', queryObject);
            return result;
        }


        // pass any object to the database and it will save
        // dataObject must match a schema AND INCLUDE tableName property
        module.exports.saveData = async (dataObject)=>{
            var result = await axios.post(GEN_API_URL+'/data/save')
        }

        module.exports.saveRecords = async(dataObjects)=>{
            dataObjects.map(dObj=>{
                saveData(dObj)
            })
        }

        module.exports.validateObject = async(dataObject)=>{
            //pull the schema,
            var result = await axios.post(GEN_API_URL+'/API/' + dataObject.tableName + '/schema');
            var schema = result.data;
            
            var errorList = [];
            //Checks - type , max length, required, precision
            
            //check for missing required fields
            schema.fields.map(schemaField=>{
                if(schemaField.IS_NULLABLE!=='YES')
                {
                    var dataObjectVal = dataObject[schemaField.COLUMN_NAME]
                    if(!dataObjectVal || dataObjectVal===null)
                    {
                        errorList.push({field:schemaField.COLUMN_NAME, error:'Non-nullable field missing or null'})
                    }
                }
                   
            })

            //recurse data object properties
            for(const prop in dataObject){
                //Find prop in schema
                if(prop!=='tableName'){
                    var field = schema.fields.find( ({ COLUMN_NAME }) => COLUMN_NAME === prop);
                    if(field){
                        

                        var propVal = dataObject[prop];
                        //Check for required or not
                            //should be done from the schema, not record incase we have missing props.
                        //Check for length of string
                        if(field.CHARACTER_MAXIMUM_LENGTH!==null)
                            if(propVal.length>field.CHARACTER_MAXIMUM_LENGTH)
                                errorList.push({field:prop,error:'value is too long for field'})

                    }else{
                        errorList.push({field:prop, error:'unknown field'})
                    }
                }
            }


            return {valid:errorList.length===0, errorList:errorList}

        }
        