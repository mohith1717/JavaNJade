package com.jadeguard.transaction;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FundFlowService {

    private final TransactionRepository transactionRepository;
    private final TransactionRouteHopRepository routeHopRepository;

    public FundFlowService(
            TransactionRepository transactionRepository,
            TransactionRouteHopRepository routeHopRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.routeHopRepository = routeHopRepository;
    }

    @Transactional(readOnly = true)
    public FundFlowResponse getFundFlow(UUID transactionId) {
        TransactionEntity transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException(
                        transactionId
                ));

        List<TransactionRouteHopEntity> storedRoute = routeHopRepository
                .findByTransactionIdOrderBySequenceAsc(transactionId);
        List<FundFlowHopResponse> route = mapRoute(storedRoute);

        CountrySummary origin = route.isEmpty()
                ? null
                : countrySummary(route.getFirst());
        CountrySummary destination = route.isEmpty()
                ? null
                : countrySummary(route.getLast());

        return new FundFlowResponse(
                transaction.getId(),
                transaction.getExternalTransactionId(),
                transaction.getAmount(),
                transaction.getCurrency(),
                transaction.getProcessingStatus(),
                transaction.getRiskScore(),
                transaction.getRiskLevel(),
                origin,
                destination,
                route.size(),
                route
        );
    }

    private List<FundFlowHopResponse> mapRoute(
            List<TransactionRouteHopEntity> storedRoute
    ) {
        List<FundFlowHopResponse> route = new ArrayList<>();
        for (int index = 0; index < storedRoute.size(); index++) {
            TransactionRouteHopEntity hop = storedRoute.get(index);
            route.add(new FundFlowHopResponse(
                    hop.getId(),
                    hop.getSequence(),
                    hopType(index, storedRoute.size()),
                    hop.getCountryCode(),
                    countryName(hop.getCountryCode()),
                    hop.getInstitution()
            ));
        }
        return List.copyOf(route);
    }

    private HopType hopType(int index, int routeSize) {
        if (index == 0) {
            return HopType.ORIGIN;
        }
        if (index == routeSize - 1) {
            return HopType.DESTINATION;
        }
        return HopType.INTERMEDIARY;
    }

    private CountrySummary countrySummary(FundFlowHopResponse hop) {
        return new CountrySummary(hop.countryCode(), hop.countryName());
    }

    private String countryName(String countryCode) {
        return Locale.of("", countryCode)
                .getDisplayCountry(Locale.ENGLISH);
    }
}
