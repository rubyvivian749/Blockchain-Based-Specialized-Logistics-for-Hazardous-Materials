;; Compliance Verification Contract
;; Ensures adherence to regulations

(define-data-var admin principal tx-sender)

;; Map to store compliance records
(define-map compliance-records
  {
    shipper: principal,
    material-id: (string-utf8 50),
    shipment-id: (string-utf8 50)
  }
  {
    is-compliant: bool,
    verification-date: uint,
    verifier: principal,
    notes: (string-utf8 200)
  }
)

;; Verify compliance for a shipment
(define-public (verify-compliance
    (shipper principal)
    (material-id (string-utf8 50))
    (shipment-id (string-utf8 50))
    (is-compliant bool)
    (notes (string-utf8 200)))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (ok (map-set compliance-records
      {
        shipper: shipper,
        material-id: material-id,
        shipment-id: shipment-id
      }
      {
        is-compliant: is-compliant,
        verification-date: block-height,
        verifier: tx-sender,
        notes: notes
      }
    ))
  )
)

;; Check if a shipment is compliant
(define-read-only (is-shipment-compliant
    (shipper principal)
    (material-id (string-utf8 50))
    (shipment-id (string-utf8 50)))
  (let ((compliance-data (map-get? compliance-records
                          {
                            shipper: shipper,
                            material-id: material-id,
                            shipment-id: shipment-id
                          })))
    (if (is-some compliance-data)
      (get is-compliant (unwrap-panic compliance-data))
      false
    )
  )
)

;; Get compliance record details
(define-read-only (get-compliance-record
    (shipper principal)
    (material-id (string-utf8 50))
    (shipment-id (string-utf8 50)))
  (map-get? compliance-records
    {
      shipper: shipper,
      material-id: material-id,
      shipment-id: shipment-id
    }
  )
)

;; Transfer admin rights
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (ok (var-set admin new-admin))
  )
)
