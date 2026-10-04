# TracePoint

TracePoint is a browser-based incident investigation simulator focused on SRE, DevOps, observability, debugging, incident response, and root-cause analysis.

> Investigate the evidence → identify the root cause → choose the remediation → understand what happened.

TracePoint uses simulated production incidents so learners can practise operational reasoning without connecting to real infrastructure.

## Features

* Simulated production incidents
* Metrics investigation
* Log investigation
* Network analysis
* Database health inspection
* Deployment history
* Incident timelines
* Root-cause identification
* Hypothesis-based investigation
* Remediation decisions
* Investigation scoring
* Post-incident explanations
* Responsive browser-based interface
* No backend or database required

## Investigation Workspace

During an incident, you can inspect different evidence sources:

```text
Metrics
Logs
Network
Database
Deployment History
Timeline
```

The evidence contains both useful signals and potential distractions.

The objective is to determine:

```text
What changed?
     ↓
What is failing?
     ↓
What evidence supports the hypothesis?
     ↓
What is the root cause?
     ↓
What should be done?
```

## Simulated Incidents

The simulator can represent incidents such as:

* Database connection pool exhaustion
* Memory leaks
* Bad deployments
* DNS failures
* External dependency failures
* CPU saturation
* Cascading failures

Each scenario contains its own incident data, evidence, timeline, possible causes, and remediation.

## Project Structure

```text
tracepoint/
│
├── index.html
│
├── style.css
├── components.css
├── animations.css
│
├── data.js
├── scenarios.js
├── timeline.js
├── simulator.js
├── evidence.js
├── scoring.js
├── ui.js
└── app.js
```

## What Each File Does

| File             | Purpose                                                                      |
| ---------------- | ---------------------------------------------------------------------------- |
| `index.html`     | Main application structure and UI containers                                 |
| `style.css`      | Global layout, typography, colors and theme                                  |
| `components.css` | Reusable component and interface styles                                      |
| `animations.css` | Small UI transitions and animations                                          |
| `data.js`        | Shared application data and incident-related information                     |
| `scenarios.js`   | Defines the simulated incident scenarios and their configuration             |
| `timeline.js`    | Handles incident timeline events and chronological investigation information |
| `simulator.js`   | Main incident investigation and simulation logic                             |
| `evidence.js`    | Handles metrics, logs, network, database and deployment evidence             |
| `scoring.js`     | Calculates investigation and incident-handling scores                        |
| `ui.js`          | Shared UI rendering and interaction helpers                                  |
| `app.js`         | Application entry point and overall application flow                         |

## Architecture

TracePoint separates the incident data from the simulator and presentation logic.

```text
                 data.js
                    │
                    ↓
              scenarios.js
                    │
                    ↓
              simulator.js
              /     |      \
             /      |       \
        evidence  timeline  scoring
           │         │         │
           └─────────┴─────────┘
                    │
                    ↓
                  ui.js
                    │
                    ↓
                 app.js
                    │
                    ↓
               index.html
```

The CSS files handle the visual layer independently:

```text
style.css
    +
components.css
    +
animations.css
    ↓
Interface styling
```

This keeps scenario definitions, simulation logic, evidence handling, scoring, and presentation reasonably separated.

## Tech Stack

TracePoint intentionally uses a lightweight frontend stack:

```
* HTML5
* CSS3
* Vanilla JavaScript
* JavaScript ES Modules
* SVG/CSS visualisations
* Browser-based state

```


## Typical Investigation Workflow

```text
Open Incident
      ↓
Read Mission
      ↓
Inspect Metrics
      ↓
Inspect Logs
      ↓
Check Network
      ↓
Check Database
      ↓
Review Deployment History
      ↓
Study Timeline
      ↓
Form Hypothesis
      ↓
Identify Root Cause
      ↓
Choose Remediation
      ↓
Simulate Recovery
      ↓
Receive Score
```

You do not necessarily need to inspect every piece of evidence. 

The goal is to learn which signals are useful for the particular incident.


## Adding a New Scenario

Incident scenarios are defined in:

```text
scenarios.js
```

A scenario can contain information such as:

```text
id
title
difficulty
service
objective
root cause
evidence
hypotheses
timeline
remediation
```

The simulator can then use the scenario through the existing investigation workflow.

This allows new incidents to be added without rebuilding the entire interface.

## Adding Evidence

Evidence is handled through the simulator's evidence system.

Typical evidence categories include:

```text
Metrics
Logs
Network
Database
Deployment
```

New evidence can be associated with a scenario so that each incident presents a different investigation path.


## Project Idea 

The intended workflow is:

```text
Observation
    ↓
Investigation
    ↓
Hypothesis
    ↓
Evidence
    ↓
Root Cause
    ↓
Remediation
    ↓
Learning
```

Rather than attempting to reproduce an entire production environment, TracePoint focuses on the most important part for a learner:

**learning how to think through a system failure.**


## Authenticity & Scope

TracePoint is a simulation and learning environment.

All incidents, services, logs, metrics, infrastructure states, and timelines are fictional training data.

TracePoint:

* Does not monitor real infrastructure.
* Does not connect to production systems.
* Does not execute real operational commands.
* Does not modify cloud resources.
* Does not provide real-time production telemetry.

Its purpose is to practise **incident investigation and operational reasoning** in a controlled environment.

