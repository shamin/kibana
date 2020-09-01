/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import moment from 'moment';

export const humanizeTimeStamp = (timeStamp: number): string =>
  moment(timeStamp).format('MMMM Do, YYYY h:mm:ss A');
