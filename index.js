import axios from "axios";
import { GEN_API_URL } from "../../src/config";
//const GEN_API_URL = "http://localhost:4000"
//table - name of table
// query - where clause (omit 'where')
// include child data objects (linked on forign keys)
export async function getData(table, query, includeChildren) {
  console.log("Using ==>", GEN_API_URL);

  let queryObject = { tableName: table, includeDeps: includeChildren };
  if (query) {
    queryObject.where = query;
  }
  var result = await axios.post(GEN_API_URL + "/data/", queryObject);
  return result;
}
export async function getDataByObj(obj) {
  var result = await axios.post(GEN_API_URL + "/data/", obj);
  return result.data;
}
export async function getXGridData(table, query, includeChildren) {
  //this pulls and preps the schema too
  var result = await axios.get(GEN_API_URL + "/API/" + table + "/schema");
  var schema = result.data;

  var cols = [];
  for (const field of schema.fields) {
    cols.push({
      field: field.DATA_COLUMN,
      header: field.DATA_COLUMN,
      width: 150,
    });
  }
  var rowres = await getData(table, query, includeChildren);

  return {
    rows: rowres.data,
    columns: cols,
  };
}
// pass any object to the database and it will save
// dataObject must match a schema AND INCLUDE tableName property
export const saveData = async (dataObject) => {
  console.log("Saving data", dataObject);

  var result = await axios.post(GEN_API_URL + "/data/save", dataObject);
  return result;
  
};

//Same as saveData however this is used when primary key is not known. Object must have id that references the primary key field
export const blindSave = async (dataObject) => {
  var result = await axios.post(GEN_API_URL + "/data/blindSave", dataObject);

  return result;
};

export const deleteDBObject = async(dataObject)=>{
  var result = await axios.delete(GEN_API_URL + '/data/delete', dataObject);
  return result;
}

export const saveRecords = async (dataObjects) => {
  dataObjects.map((dObj) => {
    saveData(dObj);
  });
};

export const validateObject = async (dataObject) => {
  //pull the schema,
  var result = await axios.get(
    GEN_API_URL + "/API/" + dataObject.tableName + "/schema"
  );
  var schema = result.data;

  var errorList = [];
  //Checks - type , max length, required, precision

  //check for missing required fields
  schema.fields.map((schemaField) => {
    if (schemaField.IS_NULLABLE !== "YES") {
      var dataObjectVal = dataObject[schemaField.COLUMN_NAME];
      if (!dataObjectVal || dataObjectVal === null) {
        errorList.push({
          field: schemaField.COLUMN_NAME,
          error: "Non-nullable field missing or null",
        });
      }
    }
  });

  //recurse data object properties
  for (const prop in dataObject) {
    //Find prop in schema
    if (prop !== "tableName") {
      var field = schema.fields.find(({ COLUMN_NAME }) => COLUMN_NAME === prop);
      if (field) {
        var propVal = dataObject[prop];
        //Check for required or not
        //should be done from the schema, not record incase we have missing props.
        //Check for length of string
        if (field.CHARACTER_MAXIMUM_LENGTH !== null)
          if (propVal.length > field.CHARACTER_MAXIMUM_LENGTH)
            errorList.push({
              field: prop,
              error: "value is too long for field",
            });
      } else {
        errorList.push({ field: prop, error: "unknown field" });
      }
    }
  }

  return { valid: errorList.length === 0, errorList: errorList };
};

const Client = {
  saveData,
  saveRecords,
  validateObject,
  getData,
  getDataByObj,
  blindSave,
  deleteDBObject
};

export default Client;
