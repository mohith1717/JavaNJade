package com.jadeguard.report;

import java.util.Map;
public class InvalidReportFilterException extends RuntimeException {
    private final Map<String, String> fieldErrors;
    public InvalidReportFilterException(Map<String, String> fieldErrors) {
        super("Report filters are invalid");
        this.fieldErrors = Map.copyOf(fieldErrors);
    }
    public Map<String, String> getFieldErrors() { return fieldErrors; }
}
