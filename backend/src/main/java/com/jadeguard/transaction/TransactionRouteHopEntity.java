package com.jadeguard.transaction;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "transaction_route_hops")
public class TransactionRouteHopEntity {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID id;

    @Column(name = "transaction_id", nullable = false)
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID transactionId;

    @Column(name = "sequence_number", nullable = false)
    private int sequence;

    @Column(name = "country_code", nullable = false, length = 2)
    @JdbcTypeCode(SqlTypes.CHAR)
    private String countryCode;

    @Column
    private String institution;

    protected TransactionRouteHopEntity() {
    }

    public TransactionRouteHopEntity(
            UUID id,
            UUID transactionId,
            int sequence,
            String countryCode,
            String institution
    ) {
        this.id = id;
        this.transactionId = transactionId;
        this.sequence = sequence;
        this.countryCode = countryCode;
        this.institution = institution;
    }

    public UUID getId() { return id; }
    public UUID getTransactionId() { return transactionId; }
    public int getSequence() { return sequence; }
    public String getCountryCode() { return countryCode; }
    public String getInstitution() { return institution; }
}
