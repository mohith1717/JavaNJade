package com.jadeguard.transaction;

import java.util.UUID;

public record FundFlowHopResponse(
        UUID id,
        int sequence,
        HopType hopType,
        String countryCode,
        String countryName,
        String institution
) {
}
