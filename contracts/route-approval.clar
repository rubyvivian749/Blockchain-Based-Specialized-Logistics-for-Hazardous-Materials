;; Route Approval Contract
;; Validates permitted transportation paths

(define-data-var admin principal tx-sender)

;; Map to store approved routes
(define-map approved-routes
  {
    origin: (string-utf8 50),
    destination: (string-utf8 50),
    material-id: (string-utf8 50)
  }
  {
    is-approved: bool,
    approval-date: uint,
    expiration-date: uint,
    restrictions: (string-utf8 200)
  }
)

;; Add an approved route
(define-public (add-approved-route
    (origin (string-utf8 50))
    (destination (string-utf8 50))
    (material-id (string-utf8 50))
    (expiration-date uint)
    (restrictions (string-utf8 200)))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (ok (map-set approved-routes
      {
        origin: origin,
        destination: destination,
        material-id: material-id
      }
      {
        is-approved: true,
        approval-date: block-height,
        expiration-date: expiration-date,
        restrictions: restrictions
      }
    ))
  )
)

;; Check if a route is approved
(define-read-only (is-route-approved
    (origin (string-utf8 50))
    (destination (string-utf8 50))
    (material-id (string-utf8 50)))
  (let ((route-data (map-get? approved-routes
                      {
                        origin: origin,
                        destination: destination,
                        material-id: material-id
                      })))
    (if (is-some route-data)
      (let ((data (unwrap-panic route-data)))
        (and
          (get is-approved data)
          (<= block-height (get expiration-date data))
        )
      )
      false
    )
  )
)

;; Get route details
(define-read-only (get-route-details
    (origin (string-utf8 50))
    (destination (string-utf8 50))
    (material-id (string-utf8 50)))
  (map-get? approved-routes
    {
      origin: origin,
      destination: destination,
      material-id: material-id
    }
  )
)

;; Revoke route approval
(define-public (revoke-route-approval
    (origin (string-utf8 50))
    (destination (string-utf8 50))
    (material-id (string-utf8 50)))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (ok (map-delete approved-routes
      {
        origin: origin,
        destination: destination,
        material-id: material-id
      }
    ))
  )
)

;; Transfer admin rights
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (ok (var-set admin new-admin))
  )
)
