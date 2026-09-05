'use strict';

class InMemoryScheduler {
  constructor() {
    this.jobs = new Map();
  }

  register(job) {
    if (this.jobs.has(job.job_id)) throw new Error(`job already registered: ${job.job_id}`);
    this.jobs.set(job.job_id, job);
    return job;
  }

  get(jobId) {
    return this.jobs.get(jobId) || null;
  }

  list() {
    return Object.freeze([...this.jobs.values()]);
  }
}

module.exports = { InMemoryScheduler };
