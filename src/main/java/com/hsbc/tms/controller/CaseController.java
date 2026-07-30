package com.hsbc.tms.controller;

import com.hsbc.tms.entity.Case;
import com.hsbc.tms.service.CaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;

    @PostMapping
    public ResponseEntity<Case> createCase(@RequestBody Case investigationCase) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(caseService.createInvestigationCase(investigationCase));
    }

    @GetMapping
    public List<Case> fetchCases() {
        return caseService.fetchCases();
    }

    @GetMapping("/{caseId}")
    public Case getCase(@PathVariable Long caseId) {
        return caseService.getCase(caseId);
    }

    @PutMapping("/{caseId}")
    public Case updateCase(@PathVariable Long caseId, @RequestBody Case investigationCase) {
        return caseService.updateCase(caseId, investigationCase);
    }

    @PostMapping("/{caseId}/assign")
    public Case assignCase(@PathVariable Long caseId, @RequestParam String assignedTo) {
        return caseService.assignCase(caseId, assignedTo);
    }

    @PostMapping("/{caseId}/close")
    public Case closeCase(@PathVariable Long caseId) {
        return caseService.closeCase(caseId);
    }

    @DeleteMapping("/{caseId}")
    public ResponseEntity<Void> deleteCase(@PathVariable Long caseId) {
        caseService.deleteCase(caseId);
        return ResponseEntity.noContent().build();
    }
}
