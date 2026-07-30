package com.hsbc.tms.service;

import com.hsbc.tms.entity.Case;
import com.hsbc.tms.enums.CaseStatus;
import com.hsbc.tms.repository.CaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CaseService {

    private final CaseRepository caseRepository;

    public Case createInvestigationCase(Case investigationCase) {
        if (investigationCase.getStatus() == null) {
            investigationCase.setStatus(CaseStatus.OPEN);
        }
        if (investigationCase.getCreatedAt() == null) {
            investigationCase.setCreatedAt(LocalDateTime.now());
        }
        return caseRepository.save(investigationCase);
    }

    public Case assignCase(Long caseId, String assignedTo) {
        Case investigationCase = getCaseById(caseId);
        investigationCase.setAssignedTo(assignedTo);
        investigationCase.setStatus(CaseStatus.IN_REVIEW);
        return caseRepository.save(investigationCase);
    }

    public Case updateCase(Long caseId, Case updatedCase) {
        Case investigationCase = getCaseById(caseId);
        investigationCase.setTitle(updatedCase.getTitle());
        investigationCase.setAssignedTo(updatedCase.getAssignedTo());
        investigationCase.setStatus(updatedCase.getStatus());
        return caseRepository.save(investigationCase);
    }

    public Case getCase(Long caseId) {
        return getCaseById(caseId);
    }

    public List<Case> fetchCases() {
        return caseRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public Case closeCase(Long caseId) {
        Case investigationCase = getCaseById(caseId);
        investigationCase.setStatus(CaseStatus.CLOSED);
        return caseRepository.save(investigationCase);
    }

    public void deleteCase(Long caseId) {
        caseRepository.delete(getCaseById(caseId));
    }

    private Case getCaseById(Long caseId) {
        return caseRepository.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found: " + caseId));
    }
}
