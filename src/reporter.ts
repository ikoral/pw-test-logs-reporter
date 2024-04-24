import axios from "axios"
import {
    Reporter,
    TestCase,
    TestError,
    TestResult,
} from "@playwright/test/reporter"
import logger from "./logger"
import dotenv from "dotenv"

// Read from default ".env" file.
dotenv.config()

/**
 * Mapping status within Playwright & TestRail
 */
const StatusMap = new Map<string, number>([
    ["failed", 5],
    ["passed", 1],
    ["skipped", 3],
    ["timedout", 5],
    ["interrupted", 5],
])

type Log = {
    organizationId: number
    testcase: string
    line: number
    error: string | undefined
    stacktrace: string | undefined
}

const failedTestsLogs: Log[] = []

export class TestLogsReporter implements Reporter {
    async onBegin?() {
        if (!process.env.FAILED_TEST_RESULTS_ENDPOINT) {
            logger(
                "No 'FAILED_TEST_RESULTS_ENDPOINT' found, skipping reporting......",
            )
        } else {
            logger(
                "Endpoint" +
                    process.env.FAILED_TEST_RESULTS_ENDPOINT +
                    " will be used",
            )
        }
    }

    onTestEnd(test: TestCase, result: TestResult) {
        if (process.env.FAILED_TEST_RESULTS_ENDPOINT) {
            try {
                if (result.status === "failed") {
                    let organizationId: number = 0

                    const orgAnnotation = test.annotations.find(
                        (a) => a.type === "orgId",
                    )
                    if (!orgAnnotation) {
                        logger("Organization ID not found in test annotations")
                        organizationId = 0
                    } else {
                        organizationId = parseInt(
                            orgAnnotation.description!,
                            10,
                        )
                    }

                    const testLog: Log = {
                        organizationId,
                        testcase: test.title,
                        line: test.location.line,
                        error: result.errors[0].message,
                        stacktrace: result.errors[0].stack,
                    }

                    failedTestsLogs.push(testLog)
                }
            } catch (error) {
                console.log(error)
            }
        } else {
            logger(
                "Failed test case log could not be pushed into failedTestsLogs!",
            )
        }
    }

    async onEnd(): Promise<void> {
        if (process.env.FAILED_TEST_RESULTS_ENDPOINT) {
            // make an api call to log endpoint
            logger("Updating test status for the following TestRail Run ID: ")

            for (const log of failedTestsLogs) {
                try {
                    const response = await axios.post(
                        process.env.FAILED_TEST_RESULTS_ENDPOINT,
                        log,
                    )
                    logger(
                        `Test case ${log.testcase} updated with status ${response.status}`,
                    )
                } catch (error) {
                    logger(
                        `Failed to update test case ${log.testcase} with error: ${error}`,
                    )
                }
            }
        }
    }
    onError(error: TestError): void {
        logger(error.message)
    }
}
