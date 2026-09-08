// Illustrative field scenarios, not claims about identifiable facilities.
const projects = [
  {
    title: "Classroom roof repairs",
    sector: 2,
    place: "Central area",
    location: "Primary school compound, behind the community meeting point.",
    stakeholder: "LGA Education Department",
    action:
      "Confirm when the remaining roofing sheets will be fixed and arrange another visit.",
    visits: [
      "Roofing sheets have been fixed on one of the two classroom blocks. The second block is still open, and some timber is stacked beside the building. The classrooms are not yet ready for use.",
      "Work has started on the second classroom block. The timber frame is in place, but the roofing sheets have not been fixed. The first block still needs ceiling boards and cleaning.",
      "Both classroom blocks are now roofed. Ceiling work is still ongoing in one block, and there are loose materials in the compound. A follow-up visit is needed before the rooms are put to use.",
    ],
  },
  {
    title: "Health centre waiting area",
    sector: 1,
    place: "Town centre",
    location:
      "Front entrance of the primary health centre, near the main road.",
    stakeholder: "LGA Primary Health Care Department",
    action: "Follow up on seating, finishing work and access to the entrance.",
    visits: [
      "The frame for the waiting-area shelter is in place. Roofing has not started. People waiting for services are using the open space beside the entrance.",
      "The shelter has been roofed, and the floor has been levelled. Seats have not been provided. Building materials are still close to the entrance.",
      "The floor is complete and some seats have been brought in. The entrance needs to be cleared of leftover materials before the waiting area can be used safely.",
    ],
  },
  {
    title: "Market drainage repairs",
    sector: 5,
    place: "Market area",
    location: "Drain beside the market entrance and the loading area.",
    stakeholder: "LGA Works Department",
    action:
      "Check that the drain is connected to an outlet and cleared before the work is closed.",
    visits: [
      "A section of the drain has been opened for repairs. Sand and broken concrete are piled beside the walkway. The repaired section does not yet connect to the outlet.",
      "Concrete lining has been completed along part of the drain. The outlet is still blocked with sand. Access to two shop entrances remains narrow.",
      "The repaired drain now reaches the outlet. Some sand remains in the channel and should be removed. The walkway also needs to be levelled where materials were stored.",
    ],
  },
];
const services = [
  {
    title: "Community borehole water supply",
    sector: 4,
    place: "Residential area",
    location: "Shared water point near the community meeting area.",
    stakeholder: "LGA Water and Sanitation Unit",
    action:
      "Ask the maintenance team to inspect the pump and confirm a repair date.",
    visits: [
      "No water came out when the pump was operated during the visit. The tap fittings appear intact. The cause of the fault could not be confirmed from the site visit alone.",
      "The water point was still not working during the follow-up visit. No maintenance activity was observed. The pump needs to be checked by a qualified technician.",
      "Water came out during a short test at the water point. The flow stopped twice. Another check is needed to confirm that supply remains steady before the issue is closed.",
    ],
  },
  {
    title: "Health centre water storage",
    sector: 1,
    place: "Central area",
    location: "Water tank beside the primary health centre service entrance.",
    stakeholder: "LGA Primary Health Care Department",
    action:
      "Arrange an inspection of the leaking connection and check the tank after repairs.",
    visits: [
      "Water was leaking from a pipe connection below the storage tank. The ground around the stand was wet. The tank itself could not be checked closely during the visit.",
      "The leaking connection has been replaced. The area around the stand was dry at the time of the visit, but the tank had not yet been filled for a proper check.",
      "The tank was filled during the visit and no leak was seen at the repaired connection. A further check after normal use will help confirm that the repair has held.",
    ],
  },
  {
    title: "Skills centre training equipment",
    sector: 3,
    place: "Town centre",
    location: "Training room beside the community hall.",
    stakeholder: "LGA Community Development Department",
    action:
      "Confirm which equipment is ready for use and record any items that still need repairs.",
    visits: [
      "Six sewing machines were in the training room. Two had missing drive belts and could not be tested. The remaining machines need to be checked before the next training session.",
      "Replacement belts have been provided for one machine. The second machine still needs a belt. The equipment list should be updated to show which machines are ready for use.",
      "All six machines were present. Five could be operated during the visit, while one still needs adjustment. The centre should confirm readiness before scheduling the next practical session.",
    ],
  },
];
export function sampleContent(lgaIndex, kind) {
  return (kind ? services : projects)[lgaIndex % 3];
}
