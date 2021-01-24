import { env, version } from 'vscode';
import { Environment } from '../interfaces/environment';
import { TelemetryEvent } from '../interfaces/telemetry';

/**
 * Enhances a `TelemetryEvent` by injecting environmental data to its properties and context 
 * @param event the event to enhance
 * @param environment the environment data to inject the event with
 */
export function enhance(event: TelemetryEvent, environment: Environment): TelemetryEvent {
  //Inject Client name and version,  Extension id and version, and timezone to the event properties  
  const properties = event.properties ? event.properties : {};
  properties.clientName = env.appName;
  properties.clientVersion = version;
  properties.timezone = environment.timezone;

  //Inject Plateform specific data in segment's context, so it can be recognized by the end destination
  const context = event.context ? event.context : {};
  context.ip = '0.0.0.0';
  context.os = {
    name: environment.platform.name,
    version: environment.platform.version,
  };
  context.locale = environment.locale;
  context.location = {
    // This is inacurate in some cases (user uses a different locale than from his actual country), 
    // but still provides an interesting metric in most cases. 
    country: environment.country
  };
  context.timezone = environment.timezone;

  const enhancedEvent: TelemetryEvent = {
    name: event.name,
    type: event.type, // type of telemetry event such as : identify, track, page, etc.
    properties: properties,
    measures: event.measures,
    traits: event.traits,
    context: context
  };
  return enhancedEvent;
}