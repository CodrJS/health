import type { Consumer, Producer, Admin } from "kafkajs";
import type { Connection } from "mongoose";

type STATE = "UP" | "DOWN";
type HealthType = "consumer" | "producer" | "admin" | "express" | "mongo";
type Event = "connect" | "disconnect";

class SystemStatus {
  private consumers: Record<string, { status: STATE }> = {};
  private producers: Record<string, { status: STATE }> = {};
  private admin: STATE = "DOWN";
  private express: STATE = "DOWN";
  private mongo: STATE = "DOWN";

  public addConsumer(topic: string, consumer: Consumer) {
    consumer.on("consumer.connect", () => this.onConnect("consumer", topic));
    consumer.on("consumer.disconnect", () =>
      this.onDisconnect("consumer", topic),
    );
  }

  public addProducer(topic: string, producer: Producer) {
    producer.on("producer.connect", () => this.onConnect("producer", topic));
    producer.on("producer.disconnect", () =>
      this.onDisconnect("producer", topic),
    );
  }

  public addAdmin(admin: Admin) {
    admin.on("admin.connect", () => this.onConnect("admin"));
    admin.on("admin.disconnect", () => this.onDisconnect("admin"));
  }

  public addMongo(connection: Connection) {
    // listen to mongoose's connection events
    connection.on("open", () => this.onConnect("mongo"));
    connection.on("reconnected", () => this.onConnect("mongo"));
    // no need for "close," "disconnected" is called on all disconnect reasons.
    connection.on("disconnected", () => this.onDisconnect("mongo"));
  }

  public handleEvent(type: HealthType, event: Event) {
    switch (event) {
      case "connect":
        this.onConnect(type);
        break;
      case "disconnect":
        this.onDisconnect(type);
        break;
    }
  }

  private onConnect(type: HealthType): void;
  private onConnect(type: HealthType, topic: string): void;
  private onConnect(type: HealthType, topic?: string) {
    switch (type) {
      case "admin":
        this.admin = "UP";
        break;
      case "express":
        this.express = "UP";
        break;
      case "mongo":
        this.mongo = "UP";
        break;
      case "consumer":
        this.consumers[topic as string] = { status: "UP" };
        break;
      case "producer":
        this.producers[topic as string] = { status: "UP" };
        break;
    }
  }

  private onDisconnect(type: HealthType): void;
  private onDisconnect(type: HealthType, topic: string): void;
  private onDisconnect(type: HealthType, topic?: string) {
    switch (type) {
      case "admin":
        this.admin = "DOWN";
        break;
      case "express":
        this.express = "DOWN";
        break;
      case "mongo":
        this.mongo = "DOWN";
        break;
      case "consumer":
        this.consumers[topic as string] = { status: "DOWN" };
        break;
      case "producer":
        this.producers[topic as string] = { status: "DOWN" };
        break;
    }
  }

  public getStatus() {
    return {
      status: "UP",
      services: [
        {
          name: "Express API",
          status: this.express,
        },
        {
          name: "MongoDB",
          status: this.mongo,
        },
        {
          name: "Kafka Admin",
          status: this.admin,
        },
      ],
      topics: {
        consumers: this.consumers,
        producers: this.producers,
      },
    };
  }
}

const ServiceHealth = new SystemStatus();
export default ServiceHealth;
