import { OAuth2Client } from "google-auth-library";
import { google, tasks_v1 } from "googleapis";

export default class GTasks {
  private tasks: tasks_v1.Tasks;

  constructor(oAuth2Client: OAuth2Client) {
    this.tasks = google.tasks({
      version: "v1",
      auth: oAuth2Client,
    });
  }

  /**
   * Lists the next 10 events on the user's primary calendar.
   */
  public async listTasks() {
    try {
      const res = await this.tasks.tasklists.list({
        maxResults: 10,
      });
      const taskLists = res.data.items;
      if (taskLists) {
        console.log("Task lists:");
        taskLists.forEach((taskList) => {
          console.log(`${taskList.title} (${taskList.id})`);
        });
      } else {
        console.log("No task lists found.");
      }
    } catch (err) {
      return console.error("The API returned an error: " + err);
    }
  }

  private async getFirstTaskList() {
    const response = await this.tasks.tasklists.list({ maxResults: 1 });
    if (!response.data.items || response.data.items.length === 0) {
      throw new Error("no task lists available");
    }
    return response.data.items[0];
  }

  public async createTask(task: tasks_v1.Schema$Task) {
    try {
      const taskList = await this.getFirstTaskList();
      const taskListId = taskList.id;
      const taskListTitle = taskList.title;
      if (!taskListId || !taskListTitle) {
        throw new Error("received malformed task list");
      }
      await this.tasks.tasks.insert({
        tasklist: taskListId,
        requestBody: task,
      });
      console.log("Task created in task list: %s", taskListTitle);
    } catch (err) {
      console.log("There was an error contacting the Tasks service: " + err);
      return;
    }
  }
}
