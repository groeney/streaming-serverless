const cwd = process.cwd();
const debug = require("debug")("models:tasks");
const shortid = require("shortid");

const dynamoose = require("dynamoose");
const TaskSchema = new dynamoose.Schema(
  {
    task_id: {
      type: String,
      hasKey: true,
      default: shortid.generate
    },
    title: {
      type: String,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  {
    saveUnknown: true,
    useDocumentTypes: true,
    timestamps: {
      createdAt: "create_time",
      updatedAt: "update_time"
    }
  }
);

module.exports = () => {
  dynamoose.local("http://localstack:4569");

  return dynamoose.model("Tasks", TaskSchema, {
    create: false, // Do this with Terraform
    waitForActive: false
  });
};
