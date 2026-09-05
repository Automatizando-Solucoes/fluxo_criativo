'use strict';

class InMemoryScheduler {
  constructor() {
    this.jobs = new Map();
    this.idempotencyKeys = new Map();
  }

  register(job) {
    if (this.jobs.has(job.job_id)) throw new Error(`job already registered: ${job.job_id}`);
    if (this.idempotencyKeys.has(job.idempotency_key)) {
      throw new Error(`idempotency key already registered: ${job.idempotency_key}`);
    }
    this.jobs.set(job.job_id, job);
    this.idempotencyKeys.set(job.idempotency_key, job.job_id);
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
