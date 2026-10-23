'use strict';

function scheduleMathErrorRetry(controller, message, minimumDelay) {
  if (!controller || !message || typeof message !== 'object') return false;
  if (message.uri !== controller.sourceUri.toString()) return false;
  if (!Number.isInteger(message.version) || message.version < 0) return false;
  if (!Number.isInteger(message.renderRevision) || message.renderRevision < 0) return false;
  if (message.renderRevision !== controller.renderGeneration) return false;

  controller.scheduleRender(Math.max(minimumDelay, controller.updateDelay()));
  return true;
}

module.exports = { scheduleMathErrorRetry };
